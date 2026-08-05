import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import HuntPlacePicker from './HuntPlacePicker';
import WeatherWidget from './WeatherWidget';
import type { Draft } from './HuntEventEditor';

interface LocationProps {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
}

export const HuntEventLocationStep = ({ draft, setDraft }: LocationProps) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="ev-loc" className="text-hero-muted">Место охоты</Label>
      <div className="mt-1.5">
        <HuntPlacePicker
          address={draft.locationName}
          lat={draft.lat}
          lng={draft.lng}
          onChange={(patch) =>
            setDraft((d) => ({
              ...d,
              ...(patch.address !== undefined ? { locationName: patch.address } : {}),
              ...(patch.lat !== undefined ? { lat: patch.lat } : {}),
              ...(patch.lng !== undefined ? { lng: patch.lng } : {}),
              ...(patch.region !== undefined ? { region: patch.region } : {}),
            }))
          }
        />
      </div>
    </div>

    {draft.lat !== null && draft.lng !== null && draft.date && (
      <WeatherWidget lat={draft.lat} lng={draft.lng} date={draft.date} />
    )}
  </div>
);

interface ReminderProps {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
}

export const HuntEventReminderStep = ({ draft, setDraft }: ReminderProps) => (
  <div className="space-y-4">
    <button
      type="button"
      onClick={() => setDraft((d) => ({ ...d, reminder: !d.reminder }))}
      className={`flex w-full items-center gap-3 rounded-sm border px-4 py-4 text-left transition-colors ${
        draft.reminder ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
          draft.reminder ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
        }`}
      >
        {draft.reminder && <Icon name="Check" size={13} />}
      </span>
      <span>
        <span className="block text-sm font-medium text-hero-text">Добавить в календарь телефона</span>
        <span className="mt-0.5 block text-xs text-hero-muted">
          После сохранения событие автоматически появится в календаре телефона с напоминанием за 12 часов
          (может понадобиться разрешение на доступ к календарю).
        </span>
      </span>
    </button>
  </div>
);