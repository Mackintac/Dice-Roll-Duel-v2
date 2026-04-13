import 'dotenv/config';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { prisma } from './app/lib/db';
import { calculateElo } from './app/lib/elo';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

interface QueuedPlayer {
  socketId: string;
  playerId: string;
  playerName: string;
  elo: number;
}

interface RoomState {
  player1: QueuedPlayer;
  player2: QueuedPlayer;
  rounds: { roll1: number; roll2: number; winnerId: string | null }[];
  p1RoundWins: number;
  p2RoundWins: number;
  readyToRoll: Set<string>;
}

const queue: QueuedPlayer[] = [];
const rooms = new Map<string, RoomState>();

// Bot state — populated on startup
const BOT_NAMES = ['Bot Alpha', 'Bot Beta', 'Bot Gamma'];
const botPlayerIds = new Set<string>();

let io: Server;

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function isBot(playerId: string): boolean {
  return botPlayerIds.has(playerId);
}

function tryMatchmaking() {
  if (queue.length < 2) return;

  const player1 = queue.shift()!;
  const player2 = queue.shift()!;

  const roomId = `${player1.socketId}-${player2.socketId}`;

  rooms.set(roomId, {
    player1,
    player2,
    rounds: [],
    p1RoundWins: 0,
    p2RoundWins: 0,
    readyToRoll: new Set(),
  });

  // Only real sockets join the room; bot socket IDs are fake
  if (!isBot(player1.playerId)) {
    io.sockets.sockets.get(player1.socketId)?.join(roomId);
  }
  if (!isBot(player2.playerId)) {
    io.sockets.sockets.get(player2.socketId)?.join(roomId);
  }

  io.to(roomId).emit('match_found', {
    roomId,
    player1: { id: player1.playerId, name: player1.playerName, elo: player1.elo },
    player2: { id: player2.playerId, name: player2.playerName, elo: player2.elo },
  });

  console.log(`Match started: ${player1.playerName} vs ${player2.playerName}`);

  // Bots auto-roll after a short random delay
  if (isBot(player1.playerId)) scheduleBotRoll(roomId, player1.playerId);
  if (isBot(player2.playerId)) scheduleBotRoll(roomId, player2.playerId);
}

function scheduleBotRoll(roomId: string, botId: string) {
  const delay = 800 + Math.random() * 1200; // 0.8–2 s
  setTimeout(() => handleRoll(roomId, botId), delay);
}

async function requeueBot(botId: string) {
  if (queue.some((p) => p.playerId === botId)) return;
  setTimeout(async () => {
    if (queue.some((p) => p.playerId === botId)) return;
    try {
      const bot = await prisma.player.findUniqueOrThrow({ where: { id: botId } });
      queue.push({
        socketId: `bot-${botId}`,
        playerId: botId,
        playerName: bot.name,
        elo: bot.elo,
      });
      console.log(`${bot.name} re-queued. Queue size: ${queue.length}`);
      tryMatchmaking();
    } catch (err) {
      console.error('Failed to re-queue bot:', err);
    }
  }, 60_000);
}

async function initBots() {
  for (const name of BOT_NAMES) {
    const bot = await prisma.player.upsert({
      where: { name },
      create: { name, elo: 1000 },
      update: {},
    });
    botPlayerIds.add(bot.id);
    console.log(`Bot initialized: ${bot.name} (${bot.id})`);
  }
  for (const botId of botPlayerIds) {
    await requeueBot(botId);
  }
}

// Core roll/round logic, callable from both socket events and bot scheduler
function handleRoll(roomId: string, playerId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.readyToRoll.add(playerId);

  io.to(roomId).emit('roll_ready', {
    count: room.readyToRoll.size,
    readyPlayerIds: Array.from(room.readyToRoll),
  });

  if (room.readyToRoll.size < 2) return;

  room.readyToRoll.clear();

  const roll1 = rollDie();
  const roll2 = rollDie();

  let roundWinnerId: string | null = null;
  if (roll1 > roll2) roundWinnerId = room.player1.playerId;
  else if (roll2 > roll1) roundWinnerId = room.player2.playerId;

  const round = { roll1, roll2, winnerId: roundWinnerId };
  room.rounds.push(round);

  if (roundWinnerId === room.player1.playerId) room.p1RoundWins++;
  else if (roundWinnerId === room.player2.playerId) room.p2RoundWins++;

  io.to(roomId).emit('round_result', {
    roll1,
    roll2,
    winnerId: roundWinnerId,
    wins: {
      [room.player1.playerId]: room.p1RoundWins,
      [room.player2.playerId]: room.p2RoundWins,
    },
    roundIndex: room.rounds.length - 1,
  });

  if (room.p1RoundWins >= 2 || room.p2RoundWins >= 2) {
    const winnerId =
      room.p1RoundWins >= 2 ? room.player1.playerId : room.player2.playerId;
    const loserId =
      winnerId === room.player1.playerId
        ? room.player2.playerId
        : room.player1.playerId;

    const winnerElo =
      winnerId === room.player1.playerId ? room.player1.elo : room.player2.elo;
    const loserElo =
      winnerId === room.player1.playerId ? room.player2.elo : room.player1.elo;

    const { newWinner, newLoser, delta } = calculateElo(winnerElo, loserElo);

    prisma
      .$transaction(async (tx) => {
        await tx.match.create({
          data: {
            player1Id: room.player1.playerId,
            player2Id: room.player2.playerId,
            winnerId,
            eloChange: delta,
            rounds: {
              create: room.rounds.map((r, i) => ({
                roll1: r.roll1,
                roll2: r.roll2,
                winnerId: r.winnerId,
                index: i,
              })),
            },
          },
        });

        await tx.player.update({
          where: { id: winnerId },
          data: { elo: newWinner, wins: { increment: 1 } },
        });

        await tx.player.update({
          where: { id: loserId },
          data: { elo: newLoser, losses: { increment: 1 } },
        });
      })
      .catch(console.error);

    io.to(roomId).emit('match_over', {
      winnerId,
      winnerName:
        winnerId === room.player1.playerId
          ? room.player1.playerName
          : room.player2.playerName,
      delta,
      rounds: room.rounds,
    });

    const { player1, player2 } = room;
    rooms.delete(roomId);

    // Re-queue bots immediately after the match ends
    if (isBot(player1.playerId)) requeueBot(player1.playerId);
    if (isBot(player2.playerId)) requeueBot(player2.playerId);
  } else {
    // Schedule bot roll for the next round
    if (isBot(room.player1.playerId)) scheduleBotRoll(roomId, room.player1.playerId);
    if (isBot(room.player2.playerId)) scheduleBotRoll(roomId, room.player2.playerId);
  }
}

app.prepare().then(async () => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Seed bots into the DB and queue them up
  await initBots();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Player joins matchmaking queue
    socket.on('join_queue', async (data: { playerId: string }) => {
      try {
        const player = await prisma.player.findUniqueOrThrow({
          where: { id: data.playerId },
        });

        // Safety guard: reject if somehow a bot ID is sent
        if (isBot(player.id)) return;

        // Remove if already in queue
        const existingIndex = queue.findIndex((p) => p.playerId === player.id);
        if (existingIndex !== -1) queue.splice(existingIndex, 1);

        const queuedPlayer: QueuedPlayer = {
          socketId: socket.id,
          playerId: player.id,
          playerName: player.name,
          elo: player.elo,
        };

        queue.push(queuedPlayer);
        socket.emit('queue_joined', { position: queue.length });
        console.log(`${player.name} joined queue. Queue size: ${queue.length}`);

        tryMatchmaking();
      } catch (err) {
        console.error('join_queue error:', err);
        socket.emit('error', { message: 'Failed to join queue' });
      }
    });

    // Player leaves queue
    socket.on('leave_queue', () => {
      const index = queue.findIndex((p) => p.socketId === socket.id);
      if (index !== -1) queue.splice(index, 1);
      socket.emit('queue_left');
    });

    // Player rolls dice
    socket.on('roll', (data: { roomId: string; playerId: string }) => {
      // Ignore roll events claiming to be from a bot
      if (isBot(data.playerId)) return;
      handleRoll(data.roomId, data.playerId);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);

      const queueIndex = queue.findIndex((p) => p.socketId === socket.id);
      if (queueIndex !== -1) queue.splice(queueIndex, 1);

      for (const [roomId, room] of rooms.entries()) {
        if (
          room.player1.socketId === socket.id ||
          room.player2.socketId === socket.id
        ) {
          const disconnectedPlayer =
            room.player1.socketId === socket.id ? room.player1 : room.player2;
          const remainingPlayer =
            room.player1.socketId === socket.id ? room.player2 : room.player1;

          const disconnectedWins =
            room.player1.socketId === socket.id
              ? room.p1RoundWins
              : room.p2RoundWins;
          const remainingWins =
            room.player1.socketId === socket.id
              ? room.p2RoundWins
              : room.p1RoundWins;

          // Only award win/loss if the disconnecting player is currently losing
          if (disconnectedWins < remainingWins) {
            const winnerElo = remainingPlayer.elo;
            const loserElo = disconnectedPlayer.elo;
            const { newWinner, newLoser, delta } = calculateElo(
              winnerElo,
              loserElo,
            );

            try {
              await prisma.$transaction(async (tx) => {
                await tx.match.create({
                  data: {
                    player1Id: room.player1.playerId,
                    player2Id: room.player2.playerId,
                    winnerId: remainingPlayer.playerId,
                    eloChange: delta,
                    rounds: {
                      create: room.rounds.map((r, i) => ({
                        roll1: r.roll1,
                        roll2: r.roll2,
                        winnerId: r.winnerId,
                        index: i,
                      })),
                    },
                  },
                });

                await tx.player.update({
                  where: { id: remainingPlayer.playerId },
                  data: { elo: newWinner, wins: { increment: 1 } },
                });

                await tx.player.update({
                  where: { id: disconnectedPlayer.playerId },
                  data: { elo: newLoser, losses: { increment: 1 } },
                });
              });

              io.to(roomId).emit('opponent_disconnected', {
                winnerId: remainingPlayer.playerId,
                winnerName: remainingPlayer.playerName,
                delta,
              });
            } catch (err) {
              console.error('Failed to save disconnect match result:', err);
              io.to(roomId).emit('opponent_disconnected', { cancelled: true });
            }
          } else {
            // Score is tied (0-0) or disconnecting player was winning — cancel with no penalty
            io.to(roomId).emit('opponent_disconnected', { cancelled: true });
          }

          rooms.delete(roomId);

          // Re-queue any bot that was in this room
          if (isBot(room.player1.playerId)) requeueBot(room.player1.playerId);
          if (isBot(room.player2.playerId)) requeueBot(room.player2.playerId);

          break;
        }
      }
    });
  });

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
