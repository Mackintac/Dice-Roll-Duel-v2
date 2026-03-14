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

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Player joins matchmaking queue
    socket.on('join_queue', async (data: { playerId: string }) => {
      try {
        const player = await prisma.player.findUniqueOrThrow({
          where: { id: data.playerId },
        });

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

        // If 2+ players in queue, start a match
        if (queue.length >= 2) {
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

          // Join both sockets to the room
          const p1Socket = io.sockets.sockets.get(player1.socketId);
          const p2Socket = io.sockets.sockets.get(player2.socketId);

          p1Socket?.join(roomId);
          p2Socket?.join(roomId);

          // Notify both players
          io.to(roomId).emit('match_found', {
            roomId,
            player1: {
              id: player1.playerId,
              name: player1.playerName,
              elo: player1.elo,
            },
            player2: {
              id: player2.playerId,
              name: player2.playerName,
              elo: player2.elo,
            },
          });

          console.log(
            `Match started: ${player1.playerName} vs ${player2.playerName}`,
          );
        }
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
      const room = rooms.get(data.roomId);
      if (!room) return;

      // Add this player to the ready set
      room.readyToRoll.add(data.playerId);

      // Notify both players how many are ready
      io.to(data.roomId).emit('roll_ready', {
        count: room.readyToRoll.size,
        readyPlayerIds: Array.from(room.readyToRoll),
      });
      // Only roll when both players are ready
      if (room.readyToRoll.size < 2) return;

      // Reset for next round
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

      io.to(data.roomId).emit('round_result', {
        roll1,
        roll2,
        winnerId: roundWinnerId,
        wins: {
          [room.player1.playerId]: room.p1RoundWins,
          [room.player2.playerId]: room.p2RoundWins,
        },
        roundIndex: room.rounds.length - 1,
      });

      // Check if match is over (first to 2 round wins)
      if (room.p1RoundWins >= 2 || room.p2RoundWins >= 2) {
        const winnerId =
          room.p1RoundWins >= 2 ? room.player1.playerId : room.player2.playerId;
        const loserId =
          winnerId === room.player1.playerId
            ? room.player2.playerId
            : room.player1.playerId;

        const winnerElo =
          winnerId === room.player1.playerId
            ? room.player1.elo
            : room.player2.elo;
        const loserElo =
          winnerId === room.player1.playerId
            ? room.player2.elo
            : room.player1.elo;

        const { newWinner, newLoser, delta } = calculateElo(
          winnerElo,
          loserElo,
        );

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

        io.to(data.roomId).emit('match_over', {
          winnerId,
          winnerName:
            winnerId === room.player1.playerId
              ? room.player1.playerName
              : room.player2.playerName,
          delta,
          rounds: room.rounds,
        });

        rooms.delete(data.roomId);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);

      // Remove from queue
      const queueIndex = queue.findIndex((p) => p.socketId === socket.id);
      if (queueIndex !== -1) queue.splice(queueIndex, 1);

      // Notify opponent if in a room
      for (const [roomId, room] of rooms.entries()) {
        if (
          room.player1.socketId === socket.id ||
          room.player2.socketId === socket.id
        ) {
          io.to(roomId).emit('opponent_disconnected');
          rooms.delete(roomId);
          break;
        }
      }
    });
  });

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
