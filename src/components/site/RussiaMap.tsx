import Icon from '@/components/ui/icon';

const MAP_URL = 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/e4fe8ddd-f3f2-40b1-b1dd-42130141e7fd.jpg';

interface RussiaMapProps {
  x: number | null;
  y: number | null;
  onPick: (x: number, y: number) => void;
}

const RussiaMap = ({ x, y, onPick }: RussiaMapProps) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    onPick(Math.round(px * 10) / 10, Math.round(py * 10) / 10);
  };

  return (
    <div
      onClick={handleClick}
      className="relative aspect-square w-full cursor-crosshair overflow-hidden rounded-sm border border-border bg-hero-bg"
      style={{ backgroundImage: `url(${MAP_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {x !== null && y !== null && (
        <span
          className="absolute -translate-x-1/2 -translate-y-full text-primary"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <Icon name="MapPin" size={28} className="drop-shadow-[0_0_6px_rgba(217,154,63,0.8)]" fill="currentColor" />
        </span>
      )}
    </div>
  );
};

export default RussiaMap;
