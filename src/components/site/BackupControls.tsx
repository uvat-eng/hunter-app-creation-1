import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { exportBackup, importBackup } from '@/lib/backup';
import { dbGetAll } from '@/lib/local-db';
import type { HunterDto } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BackupControls = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportBackup();
      toast({ title: 'Резервная копия готова', description: 'Выберите, куда сохранить файл — Google Диск, файлы на телефоне или почта.' });
    } catch {
      toast({ title: 'Не удалось создать резервную копию' });
    } finally {
      setBusy(false);
    }
  };

  const handleImportClick = () => fileRef.current?.click();

  const runImport = async (file: File) => {
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const existing = await dbGetAll<HunterDto>('hunters');
    if (existing.length > 0) {
      setPendingFile(file);
      setConfirmOpen(true);
      return;
    }
    runImport(file);
  };

  const confirmImport = () => {
    setConfirmOpen(false);
    if (pendingFile) runImport(pendingFile);
    setPendingFile(null);
  };

  const cancelImport = () => {
    setConfirmOpen(false);
    setPendingFile(null);
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

      <AlertDialog open={confirmOpen} onOpenChange={(v) => !v && cancelImport()}>
        <AlertDialogContent className="border-border bg-hero-surface text-hero-text">
          <AlertDialogHeader>
            <AlertDialogTitle>Заменить текущие данные?</AlertDialogTitle>
            <AlertDialogDescription className="text-hero-muted">
              На этом телефоне уже есть данные охотника. Восстановление из копии добавит и обновит записи
              поверх существующих — если в копии есть более старые версии, они могут заменить текущие данные.
              Рекомендуем сначала сделать свежую резервную копию текущих данных.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelImport}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Всё равно восстановить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BackupControls;