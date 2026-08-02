import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PrivacyPolicyContent, TermsOfUseContent } from '@/components/site/LegalContent';

export type LegalDoc = 'privacy' | 'terms' | null;

const LegalDialog = ({ doc, onOpenChange }: { doc: LegalDoc; onOpenChange: (v: boolean) => void }) => (
  <Dialog open={doc !== null} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-border bg-hero-surface text-hero-text">
      <DialogHeader>
        <DialogTitle className="font-head text-2xl font-bold tracking-tight">
          {doc === 'privacy' ? 'Политика конфиденциальности' : 'Условия использования'}
        </DialogTitle>
      </DialogHeader>
      <p className="-mt-2 text-sm text-hero-muted">Дата вступления в силу: 25.07.2026</p>
      {doc === 'privacy' ? <PrivacyPolicyContent /> : <TermsOfUseContent />}
    </DialogContent>
  </Dialog>
);

export default LegalDialog;
