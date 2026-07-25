import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { medicalCertificatesApi, type MedicalCertificateDto } from '@/lib/api';
import PhotoUploadSlot from './PhotoUploadSlot';

type Draft = { number: string; issueDate: string; photo: string };
const emptyDraft = (): Draft => ({ number: '', issueDate: '', photo: '' });

const DAY_MS = 24 * 60 * 60 * 1000;

const MedicalCertificateCard = ({ hunterId }: { hunterId?: string }) => {
  const [cert, setCert] = useState<MedicalCertificateDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hunterId) {
      setCert(null);
      return;
    }
    setLoading(true);
    medicalCertificatesApi
      .get(hunterId)
      .then(setCert)
      .catch(() => toast({ title: 'Не удалось загрузить медсправку' }))
      .finally(() => setLoading(false));
  }, [hunterId]);

  const openEdit = () => {
    if (!hunterId) {
      toast({ title: 'Сначала заведите карточку охотника' });
      return;
    }
    setDraft(cert ? { number: cert.number, issueDate: cert.issueDate, photo: cert.photo } : emptyDraft());
    setOpen(true);
  };

  const save = async () => {
    if (!hunterId) return;
    if (!draft.number.trim() || !draft.issueDate) {
      toast({ title: 'Укажите номер и дату выдачи справки' });
      return;
    }
    setSaving(true);
    try {
      const saved = cert
        ? await medicalCertificatesApi.update(cert.id, draft)
        : await medicalCertificatesApi.create({ ...draft, hunterId });
      setCert(saved);
      toast({ title: 'Медсправка сохранена' });
      setOpen(false);
    } catch {
      toast({ title: 'Не удалось сохранить медсправку' });
    } finally {
      setSaving(false);
    }
  };

  const daysLeft = cert?.expiresDate
    ? Math.ceil((new Date(cert.expiresDate).getTime() - Date.now()) / DAY_MS)
    : null;
  const isExpiring = daysLeft !== null && daysLeft <= 90 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  return (
    <>
      <button
        onClick={openEdit}
        className={`flex w-full items-center gap-4 rounded-lg border p-5 text-left transition-all hover:-translate-y-0.5 ${
          isExpired
            ? 'border-destructive bg-destructive/10'
            : isExpiring
              ? 'border-hero-accent bg-hero-accent/10'
              : 'border-border bg-hero-bg'
        }`}
      >
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm ${
            isExpired ? 'bg-destructive/20 text-destructive' : isExpiring ? 'bg-hero-accent/20 text-hero-accent' : 'bg-primary/12 text-primary'
          }`}
        >
          <Icon name="FileHeart" size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-head text-lg font-semibold text-hero-text">Медицинская справка</div>
          {loading ? (
            <div className="text-sm text-hero-muted">Загружаем…</div>
          ) : cert ? (
            <div className="mt-0.5 text-sm text-hero-muted">
              № {cert.number} · действует до {new Date(cert.expiresDate).toLocaleDateString('ru')}
              {isExpired && <span className="ml-1 font-medium text-destructive">— срок истёк!</span>}
              {isExpiring && !isExpired && (
                <span className="ml-1 font-medium text-hero-accent">— истекает через {daysLeft} дн.</span>
              )}
            </div>
          ) : (
            <div className="mt-0.5 text-sm text-hero-muted">Не внесена — нажмите, чтобы добавить</div>
          )}
        </div>
        <Icon name="ChevronRight" size={18} className="shrink-0 text-hero-muted" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">Медицинская справка</DialogTitle>
            <DialogDescription className="text-hero-muted">
              Справка об отсутствии противопоказаний к владению оружием действует 5 лет — следите за сроком, без неё оружие могут изъять.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cert-number" className="text-hero-muted">Номер справки</Label>
                <Input
                  id="cert-number"
                  value={draft.number}
                  onChange={(e) => setDraft((d) => ({ ...d, number: e.target.value }))}
                  placeholder="№ 123"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <div>
                <Label htmlFor="cert-date" className="text-hero-muted">Дата выдачи</Label>
                <Input
                  id="cert-date"
                  type="date"
                  value={draft.issueDate}
                  onChange={(e) => setDraft((d) => ({ ...d, issueDate: e.target.value }))}
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
            </div>
            {draft.issueDate && (
              <p className="text-xs text-hero-muted">
                Справка будет действовать до{' '}
                <span className="font-medium text-hero-text">
                  {new Date(
                    new Date(draft.issueDate).setFullYear(new Date(draft.issueDate).getFullYear() + 5),
                  ).toLocaleDateString('ru')}
                </span>
              </p>
            )}
            <PhotoUploadSlot
              label="Фото справки"
              photo={draft.photo}
              onChange={(v) => setDraft((d) => ({ ...d, photo: v }))}
              icon="FileHeart"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? 'Сохраняем…' : 'Сохранить'}{' '}
            <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicalCertificateCard;
