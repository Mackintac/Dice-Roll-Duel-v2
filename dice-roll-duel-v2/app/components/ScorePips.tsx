interface ScorePipsProps {
  wins: number;
}

export default function ScorePips({ wins }: ScorePipsProps) {
  return (
    <div className='score-pips'>
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={i}
          className={`pip ${i < wins ? 'pip--filled' : 'pip--empty'}`}
        />
      ))}
    </div>
  );
}
