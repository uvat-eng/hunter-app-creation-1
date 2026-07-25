import { useState } from 'react';
import Icon from '@/components/ui/icon';

const links = [
  { href: '#hunts', label: 'Мои охоты' },
  { href: '#estate', label: 'Хозяйство' },
  { href: '#booking', label: 'Бронирование' },
  { href: '#gear', label: 'Оружие' },
];

const Header = ({ onStart }: { onStart: () => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-border/60 bg-hero-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <a href="#top" className="flex items-baseline gap-3">
          <span className="font-head text-xl font-bold tracking-tight text-hero-text md:text-2xl">
            Малышенское
          </span>
          <span className="hidden text-[0.68rem] uppercase tracking-[0.24em] text-hero-muted sm:inline">
            Охотхозяйство
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-hero-muted transition-colors hover:text-hero-text"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={onStart}
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Личный кабинет
          </button>
        </nav>

        <button
          className="text-hero-text md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          <Icon name={open ? 'X' : 'Menu'} size={26} />
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-hero-surface px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-3 py-3 text-hero-muted transition-colors hover:bg-secondary hover:text-hero-text"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onStart();
              }}
              className="mt-2 rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Личный кабинет
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
