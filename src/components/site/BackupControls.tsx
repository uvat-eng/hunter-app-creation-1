import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { exportBackup, importBackup } from '@/lib/backup';

const BackupControls = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportBackup();
      toast({ title: 'Резервная копия сохранена', description: 'Сохраните файл в надёжном месте — на Google Диске, почте или компьютере.' });
    } catch {
      toast({ title: 'Не удалось создать резервную копию' });
    } finally {
      setBusy(false);
    }
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      await importBackup(file);
      toast({ title: 'Данные восстановлены', description: 'Сейчас перезагрузим приложение, чтобы всё подхватилось.' });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      toast({
        title: 'Не удалось восстановить данные',
        description: err instanceof Error ? err.message : 'Проверьте файл и попробуйте снова.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
      <div className="mr-auto text-xs text-hero-muted">
        Все данные хранятся только на этом телефоне. Сделайте копию перед сменой устройства.
      </div>
      <button
        onClick={handleExport}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-hero-text transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        <Icon name="DownloadCloud" size={16} /> Сохранить копию
      </button>
      <button
        onClick={handleImportClick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-hero-text transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        <Icon name="UploadCloud" size={16} /> Восстановить из копии
      </button>
      <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} className="hidden" />
    </div>
  );
};

export default BackupControls;
