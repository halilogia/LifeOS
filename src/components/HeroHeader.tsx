
interface HeroHeaderProps {
  clockText: string;
  dateText: string;
}

export function HeroHeader({ clockText, dateText }: HeroHeaderProps) {
  return (
    <header className="hero">
      <div id="clock" className="clock">
        {clockText}
      </div>
      <div id="date" className="date">
        {dateText}
      </div>
    </header>
  );
}
