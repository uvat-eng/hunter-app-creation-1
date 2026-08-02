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
import { documentsApi, type DocumentDto, type DocumentType } from '@/lib/api';
import PhotoUploadSlot from './PhotoUploadSlot';

type Draft = { number: string; issueDate: string; photo: string };
const emptyDraft = (): Draft => ({ number: '', issueDate: '', photo: '' });

interface Props {
  hunterId?: string;
  type: DocumentType;
  title: string;
  description: string;
  icon: string;
  numberLabel: string;
  numberPlaceholder: string;
}

const DocumentCard = ({ hunterId, type, title, description, icon, numberLabel, numberPlaceholder }: Props) => {
  const [doc, setDoc] = useState<DocumentDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hunterId) {
      setDoc(null);
      return;
    }
    setLoading(true);
    documentsApi
      .get(hunterId, type)
      .then(setDoc)
      .catch(() => toast({ title: `Не удалось загрузить: ${title}` }))
      .finally(() => setLoading(false));
  }, [hunterId, type, title]);

  const openEdit = () => {
    if (!hunterId) {
      toast({ title: 'Сначала заведите карточку охотника' });
      return;
    }
    setDraft(doc ? { number: doc.number, issueDate: doc.issueDate, photo: doc.photo } : emptyDraft());
    setOpen(true);
  };

  const save = async () => {
    if (!hunterId) return;
    if (!draft.number.trim()) {
      toast({ title: `Укажите номер: ${numberLabel}` });
      return;
    }
    setSaving(true);
    try {
      const saved = doc
        ? await documentsApi.update(doc.id, draft)
        : await documentsApi.create({ ...draft, hunterId, type });
      setDoc(saved);
      toast({ title: 'Сохранено' });
      setOpen(false);
    } catch {
      toast({ title: 'Не удалось сохранить' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={openEdit}
        className="flex w-full items-center gap-4 rounded-lg border border-border bg-hero-bg p-5 text-left transition-all hover:-translate-y-0.5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary/12 text-primary">
          <Icon name={icon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-head text-lg font-semibold text-hero-text">{title}</div>
          {loading ? (
            <div className="text-sm text-hero-muted">Загружаем…</div>
          ) : doc ? (
            <div className="mt-0.5 text-sm text-hero-muted">
              № {doc.number}
              {doc.issueDate && ` · выдано ${new Date(doc.issueDate).toLocaleDateString('ru')}`}
            </div>
          ) : (
            <div className="mt-0.5 text-sm text-hero-muted">Не внесено — нажмите, чтобы добавить</div>
          )}
        </div>
        <Icon name="ChevronRight" size={18} className="shrink-0 text-hero-muted" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">{title}</DialogTitle>
            <DialogDescription className="text-hero-muted">{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`${type}-number`} className="text-hero-muted">{numberLabel}</Label>
                <Input
                  id={`${type}-number`}
                  value={draft.number}
                  onChange={(e) => setDraft((d) => ({ ...d, number: e.target.value }))}
                  placeholder={numberPlaceholder}
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <div>
                <Label htmlFor={`${type}-date`} className="text-hero-muted">Дата выдачи</Label>
                <Input
                  id={`${type}-date`}
                  type="date"
                  value={draft.issueDate}
                  onChange={(e) => setDraft((d) => ({ ...d, issueDate: e.target.value }))}
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
            </div>
            <PhotoUploadSlot
              label="Фото документа"
              photo={draft.photo}
              onChange={(v) => setDraft((d) => ({ ...d, photo: v }))}
              icon={icon}
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

export default DocumentCard;
