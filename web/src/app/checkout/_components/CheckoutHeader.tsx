import { FiLock } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

export default function CheckoutHeader() {
    const { t } = useTranslation();
    return (
        <div className="sticky top-20 md:top-24 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between mb-12 border-b border-foreground/10 pb-8 pt-4">
            <h1 className="text-2xl md:text-3xl font-serif text-foreground">{t('checkout.header.title')}</h1>
            <div className="flex items-center gap-2 text-primary">
                <FiLock size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">{t('checkout.header.badge')}</span>
            </div>
        </div>
    );
}
