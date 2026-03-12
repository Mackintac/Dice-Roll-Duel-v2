interface ScorePipsProps {
  wins: number;
}

export default function ScorePips({ wins }: ScorePipsProps) {
  return (
    <div className='flex gap-2 mt-2 justify-center'>
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={i}
          className={`
            w-3 h-3 rounded-full border-2 transition-all duration-300
            ${
              i < wins
                ? 'bg-yellow-400 border-yellow-400'
                : 'bg-transparent border-white/40'
            }
          `}
        />
      ))}
    </div>
  );
}
