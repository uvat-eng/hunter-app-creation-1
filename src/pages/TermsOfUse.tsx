import { TermsOfUseContent } from '@/components/site/LegalContent';

const TermsOfUse = () => (
  <div className="min-h-screen bg-hero-bg px-5 py-16 font-body text-hero-text md:px-10">
    <div className="mx-auto max-w-3xl">
      <a href="/" className="text-sm text-primary hover:underline">← На главную</a>
      <h1 className="mt-6 font-head text-3xl font-bold tracking-tight md:text-4xl">
        Условия использования
      </h1>
      <p className="mt-2 text-sm text-hero-muted">Дата вступления в силу: 25.07.2026</p>

      <div className="mt-8">
        <TermsOfUseContent />
      </div>
    </div>
  </div>
);

export default TermsOfUse;
