import { ShippingAddress } from '@/types/order';
import { useTranslation } from '@/hooks/useTranslation';

interface ShippingFormProps {
    shippingAddress: ShippingAddress;
    handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ShippingForm({
    shippingAddress,
    handleAddressChange
}: ShippingFormProps) {
    const { t } = useTranslation();
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-sm">1</div>
                <h2 className="text-xl font-serif text-foreground">{t('checkout.shipping.title')}</h2>
            </div>

            <div className="bg-foreground/5 p-4 md:p-8 border border-foreground/10">
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">{t('checkout.shipping.address')}</label>
                        <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                            <input
                                type="text"
                                name="address"
                                value={shippingAddress.address}
                                onChange={handleAddressChange}
                                placeholder={t('checkout.shipping.addressPlaceholder')}
                                required
                                className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">{t('checkout.shipping.city')}</label>
                            <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                                <input
                                    type="text"
                                    name="city"
                                    value={shippingAddress.city}
                                    onChange={handleAddressChange}
                                    placeholder={t('checkout.shipping.cityPlaceholder')}
                                    required
                                    className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">{t('checkout.shipping.postalCode')}</label>
                            <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={shippingAddress.postalCode}
                                    onChange={handleAddressChange}
                                    placeholder={t('checkout.shipping.postalCodePlaceholder')}
                                    required
                                    className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">{t('checkout.shipping.country')}</label>
                        <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                            <input
                                type="text"
                                name="country"
                                value={shippingAddress.country}
                                onChange={handleAddressChange}
                                placeholder={t('checkout.shipping.countryPlaceholder')}
                                required
                                className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
