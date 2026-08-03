import Icon from '@/components/ui/icon';
import MedicalCertificateCard from './MedicalCertificateCard';
import DocumentCard from './DocumentCard';
import AccessoryItems from './AccessoryItems';

const HunterDocumentsSection = ({ hunterId }: { hunterId?: string }) => (
  <>
    <div className="mt-6 space-y-4">
      <DocumentCard
        hunterId={hunterId}
        type="ticket"
        title="Охотничий билет"
        description="Дубликат данных охотничьего билета с фото — под рукой на случай проверки."
        icon="IdCard"
        numberLabel="Номер билета"
        numberPlaceholder="№ 72 000000"
      />
      <DocumentCard
        hunterId={hunterId}
        type="inspector"
        title="Удостоверение производственного инспектора"
        description="Актуально для охотников, состоящих в штате охотхозяйства."
        icon="ShieldCheck"
        numberLabel="Номер удостоверения"
        numberPlaceholder="№ 123"
      />
      <MedicalCertificateCard hunterId={hunterId} />
    </div>

    <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-hero-bg p-5 text-sm text-hero-muted">
      <Icon name="BellRing" size={20} className="shrink-0 text-primary" />
      Приложение напомнит о продлении разрешений за 60 дней до окончания срока.
    </div>

    <AccessoryItems hunterId={hunterId} />
  </>
);

export default HunterDocumentsSection;
