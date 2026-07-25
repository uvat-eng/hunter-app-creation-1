import Icon from '@/components/ui/icon';

const Footer = ({ onStart }: { onStart: () => void }) => (
  <footer className="border-t border-border bg-hero-bg py-14">
    <div className="mx-auto max-w-7xl px-5 md:px-10">
      <div className="flex flex-col justify-between gap-10 md:flex-row">
        <div className="max-w-sm">
          <div className="flex items-baseline gap-3">
            <span className="font-head text-2xl font-bold tracking-tight text-hero-text">
              Малышенское
            </span>
            <span className="text-[0.68rem] uppercase tracking-[0.24em] text-hero-muted">
              Охотхозяйство
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-hero-muted">
            Личный дневник охотника и бронирование угодий. Заповедные леса Западной Сибири,
            организованная охота с сопровождением егерей.
          </p>
          <button
            onClick={onStart}
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Завести карточку охотника <Icon name="ArrowRight" size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <div className="mb-3 text-xs uppercase tracking-wide text-hero-muted">Разделы</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#cabinet" className="text-hero-text transition-colors hover:text-primary">Кабинет</a></li>
              <li><a href="#estate" className="text-hero-text transition-colors hover:text-primary">Хозяйство</a></li>
              <li><a href="#tours" className="text-hero-text transition-colors hover:text-primary">Туры</a></li>
              <li><a href="#booking" className="text-hero-text transition-colors hover:text-primary">Бронирование</a></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs uppercase tracking-wide text-hero-muted">Охотнику</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#hunts" className="text-hero-text transition-colors hover:text-primary">Мои охоты</a></li>
              <li><a href="#gear" className="text-hero-text transition-colors hover:text-primary">Оружие</a></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs uppercase tracking-wide text-hero-muted">Контакты</div>
            <ul className="space-y-2 text-sm text-hero-muted">
              <li className="flex items-center gap-2"><Icon name="Phone" size={15} className="text-primary" /> +7 (345) 200-00-00</li>
              <li className="flex items-center gap-2"><Icon name="Mail" size={15} className="text-primary" /> hunt@malyshenskoe.ru</li>
              <li className="flex items-center gap-2"><Icon name="MapPin" size={15} className="text-primary" /> Тюменская обл.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-6 text-xs text-hero-muted">
        © {new Date().getFullYear()} Охотхозяйство «Малышенское». Охотьтесь ответственно.
      </div>
    </div>
  </footer>
);

export default Footer;
