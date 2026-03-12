'use client';
interface DiceRollerProps {
  roll1: number | null;
  roll2: number | null;
  rolling: boolean; // roll-in-progress for css anim
}

const diceFaces: Record<number, string> = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
};

export default function DiceRoller({ roll1, roll2, rolling }: DiceRollerProps) {
  return (
    <div className='dice-roller'>
      <Die value={roll1} rolling={rolling} />
      <span className='dice-vs'>VS</span>
      <Die value={roll2} rolling={rolling} />
    </div>
  );
}

interface DieProps {
  value: number | null;
  rolling: boolean;
}

function Die({ value, rolling }: DieProps) {
  return (
    <div className={`die ${rolling ? 'die--rolling' : ''}`}>
      {rolling ? '?' : value !== null ? diceFaces[value] : '?'}
    </div>
  );
}
