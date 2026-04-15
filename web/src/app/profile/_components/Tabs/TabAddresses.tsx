import { FiPlus } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import { Address } from '@/types/profile';

interface TabAddressesProps {
    addresses: Address[];
    openAddressModal: (address?: Address) => void;
    handleDeleteAddress: (addressId: string) => void;
}

export default function TabAddresses({
    addresses,
    openAddressModal,
    handleDeleteAddress
}: TabAddressesProps) {
    const { t } = useTranslation();
    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
                <h2 className="text-lg md:text-xl font-bold text-foreground">{t('profile.tabs.addresses.title')}</h2>
                <button onClick={() => openAddressModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/80 transition-all rounded-lg">
                    <FiPlus /> {t('profile.tabs.addresses.newRegistry')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {addresses?.map((address) => (
                    <div key={address._id} className="p-4 md:p-6 border border-foreground/10 rounded-xl hover:border-foreground transition-all relative group bg-foreground/5">
                        {address.isDefault && <div className="absolute top-4 right-4 text-[8px] font-bold uppercase tracking-widest text-background bg-foreground px-2 py-1 rounded">{t('profile.tabs.addresses.primary')}</div>}
                        <h4 className="font-bold text-foreground mb-4">{address.title}</h4>
                        <div className="text-sm text-foreground/50 space-y-1 mb-8">
                            <p className="font-medium text-foreground">{address.fullAddress}</p>
                            <p>{address.district}, {address.city}</p>
                            <p className="font-mono text-xs opacity-60">{address.postalCode}</p>
                            <p className="pt-2 font-mono text-xs text-foreground">{address.phone}</p>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-background group-hover:border-foreground/10 transition-all">
                            <button onClick={() => openAddressModal(address)} className="text-[10px] font-bold uppercase tracking-widest hover:text-foreground">{t('profile.tabs.addresses.edit')}</button>
                            <button onClick={() => handleDeleteAddress(address._id)} className="text-[10px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500">{t('profile.tabs.addresses.delete')}</button>
                        </div>
                    </div>
                ))}
                {(!addresses || addresses.length === 0) && (
                    <div className="col-span-2 py-20 text-center italic text-foreground/40 border border-dashed border-foreground/10 rounded-xl">
                        {t('profile.tabs.addresses.empty')}
                    </div>
                )}
            </div>
        </div>
    );
}
