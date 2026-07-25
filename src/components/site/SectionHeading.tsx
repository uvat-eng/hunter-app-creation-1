const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => (
  <div className="mb-12 max-w-2xl">
    <span className="mb-4 inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-hero-accent">
      <span className="inline-block h-px w-8 bg-hero-accent" />
      {eyebrow}
    </span>
    <h2 className="font-head text-3xl font-bold leading-tight tracking-tight text-hero-text sm:text-4xl md:text-5xl">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base leading-relaxed text-hero-muted md:text-lg">{description}</p>
    )}
  </div>
);

export default SectionHeading;
