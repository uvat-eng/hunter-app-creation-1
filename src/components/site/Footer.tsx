import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import LegalDialog, { type LegalDoc } from '@/components/site/LegalDialog';

const Footer = ({ onStart }: { onStart: () => void }) => {
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);

  return (
    <footer className="border-t border-border bg-hero-bg py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-baseline gap-3">
              <span className="font-head text-2xl font-bold tracking-tight text-hero-text">
                Личный кабинет
              </span>
              <span className="text-[0.68rem] uppercase tracking-[0.24em] text-hero-muted">
                Охотника
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-hero-muted">
              Личный дневник охотника: календарь выездов, учёт трофеев, бюджет и оружие —
              всё в одном приложении для вас.
            </p>
            <button
              onClick={onStart}
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Завести карточку охотника <Icon name="ArrowRight" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-2">
            <div>
              <div className="mb-3 text-xs uppercase tracking-wide text-hero-muted">Личный кабинет</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-hero-text transition-colors hover:text-primary">Кабинет</Link></li>
                <li><Link to="/calendar" className="text-hero-text transition-colors hover:text-primary">Календарь охот</Link></li>
                <li><Link to="/hunts" className="text-hero-text transition-colors hover:text-primary">Дневник</Link></li>
                <li><Link to="/gear" className="text-hero-text transition-colors hover:text-primary">Оружие</Link></li>
                <li><Link to="/map" className="text-hero-text transition-colors hover:text-primary">Карта охот</Link></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-xs uppercase tracking-wide text-hero-muted">Контакты</div>
              <ul className="space-y-2 text-sm text-hero-muted">
                <li className="flex items-center gap-2"><Icon name="Phone" size={15} className="text-primary" /> +7 908 878-77-33</li>
                <li className="flex items-center gap-2"><Icon name="Mail" size={15} className="text-primary" /> kid.tmn.gun@gmail.com</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs leading-relaxed text-hero-muted md:flex-row md:items-end md:justify-between">
          <p>
            Охотимся с головой, безопасность на охоте — это личная ответственность каждого охотника. Думайте головой,
            а не стаканом. Не бухайте, соблюдайте правила охоты, они написаны кровью. Всех нас дома ждут семьи, жёны,
            дети. Пусть охота для каждого охотника будет любимым хобби, а не обременением.
            <br className="hidden sm:block" />
            Создано коллективом охотничьего хозяйства «Малышенское», с. Малоскаредное, Аромашевский район Тюменской
            области. {new Date().getFullYear()} год.
          </p>
          <div className="flex shrink-0 gap-4">
            <button
              type="button"
              onClick={() => setLegalDoc('privacy')}
              className="text-hero-text transition-colors hover:text-primary"
            >
              Конфиденциальность
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc('terms')}
              className="text-hero-text transition-colors hover:text-primary"
            >
              Условия
            </button>
          </div>
        </div>
      </div>

      <LegalDialog doc={legalDoc} onOpenChange={(v) => !v && setLegalDoc(null)} />
    </footer>
  );
};

export default Footer;
