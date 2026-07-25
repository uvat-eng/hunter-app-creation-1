import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { fileToCompressedDataUrl } from '@/lib/image';

interface Props {
  label: string;
  photo: string;
  onChange: (dataUrl: string) => void;
  icon?: string;
}

const PhotoUploadSlot = ({ label, photo, onChange, icon = 'Camera' }: Props) => {
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch {
      toast({ title: 'Не удалось обработать фото', description: 'Попробуйте другой файл.' });
    }
    e.target.value = '';
  };

  return (
    <div>
      <div className="mb-1.5 text-sm text-hero-muted">{label}</div>
      {photo ? (
        <div className="group relative aspect-video w-full overflow-hidden rounded-sm border border-border">
          <img src={photo} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Icon name="X" size={13} />
          </button>
          <label className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1.5 bg-black/50 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Icon name="RefreshCw" size={12} /> Заменить
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
        </div>
      ) : (
        <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-border text-hero-muted transition-colors hover:border-primary hover:text-primary">
          <Icon name={icon} size={22} />
          <span className="text-xs">Добавить фото</span>
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
      )}
    </div>
  );
};

export default PhotoUploadSlot;
