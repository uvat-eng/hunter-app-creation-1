import Icon from '@/components/ui/icon';
import type { Draft } from './HuntEventEditor';

interface PhotosProps {
  draft: Draft;
  onPhotos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (i: number) => void;
}

export const HuntEventPhotosStep = ({ draft, onPhotos, removePhoto }: PhotosProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-5 gap-2">
      {draft.photos.map((p, i) => (
        <div key={i} className="group relative aspect-square overflow-hidden rounded-sm border border-border">
          <img src={p} alt="" className="h-full w-full object-cover" />
          <button
            onClick={() => removePhoto(i)}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      ))}
      {draft.photos.length < 5 && (
        <label className="flex aspect-square cursor-pointer items-center justify-center rounded-sm border border-dashed border-border text-hero-muted transition-colors hover:border-primary hover:text-primary">
          <Icon name="Camera" size={20} />
          <input type="file" accept="image/*" multiple onChange={onPhotos} className="hidden" />
        </label>
      )}
    </div>
    <p className="text-xs text-hero-muted">До 5 фотографий, {5 - draft.photos.length} осталось.</p>
  </div>
);

interface VideosProps {
  draft: Draft;
  maxVideos: number;
  maxVideoMb: number;
  onVideos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeVideo: (i: number) => void;
}

export const HuntEventVideosStep = ({ draft, maxVideos, maxVideoMb, onVideos, removeVideo }: VideosProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      {draft.videos.map((v, i) => (
        <div key={i} className="group relative aspect-square overflow-hidden rounded-sm border border-border">
          <video src={v} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Icon name="Play" size={20} className="text-white" />
          </div>
          <button
            onClick={() => removeVideo(i)}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      ))}
      {draft.videos.length < maxVideos && (
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border text-hero-muted transition-colors hover:border-primary hover:text-primary">
          <Icon name="Video" size={20} />
          <input type="file" accept="video/*" multiple onChange={onVideos} className="hidden" />
        </label>
      )}
    </div>
    <p className="text-xs text-hero-muted">
      До {maxVideos} видео, {maxVideos - draft.videos.length} осталось. Максимум {maxVideoMb} МБ на файл.
    </p>
  </div>
);
