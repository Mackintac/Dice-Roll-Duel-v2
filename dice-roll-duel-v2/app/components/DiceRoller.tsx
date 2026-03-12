'use client';

interface DiceRollerProps {
  roll1: number | null;
  roll2: number | null;
  rolling: boolean; //roll in-progress for css anim
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
    <div className='flex items-center justify-center gap-8 py-8'>
      <Die value={roll1} rolling={rolling} />
      <span className='text-white/40 font-bold text-sm tracking-widest'>
        VS
      </span>
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
    <div
      className={`
        w-24 h-24 bg-white rounded-2xl shadow-lg
        flex items-center justify-center
        text-5xl font-bold text-gray-800
        transition-all duration-200
        ${rolling ? 'animate-bounce scale-110' : ''}
      `}
    >
      {rolling ? '?' : value !== null ? diceFaces[value] : '?'}
    </div>
  );
}
