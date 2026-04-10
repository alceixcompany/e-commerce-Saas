import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

interface AddressModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingAddress: any;
    addressForm: any;
    setAddressForm: (form: any) => void;
}

export default function AddressModal({
    show,
    onClose,
    onSubmit,
    editingAddress,
    addressForm,
    setAddressForm
}: AddressModalProps) {
    const { t } = useTranslation();
    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-foreground/30 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-background max-w-xl w-full p-6 md:p-10 rounded-2xl shadow-2xl relative z-10 border border-foreground/10"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 text-foreground/40 hover:text-foreground transition-all">
                            <FiX size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-foreground mb-8">
                            {editingAddress ? t('profile.addressModal.edit') : t('profile.addressModal.add')}
                        </h3>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('profile.addressModal.identifier')}</label>
                                <input
                                    type="text"
                                    placeholder={t('profile.addressModal.identifierPlaceholder')}
                                    value={addressForm.title}
                                    onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                                    required
                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('profile.addressModal.completeAddress')}</label>
                                <textarea
                                    placeholder={t('profile.addressModal.addressPlaceholder')}
                                    value={addressForm.fullAddress}
                                    onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                                    required
                                    rows={2}
                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground resize-none"
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder={t('profile.addressModal.city')}
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    required
                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground"
                                />
                                <input
                                    type="text"
                                    placeholder={t('profile.addressModal.district')}
                                    value={addressForm.district}
                                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                    required
                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder={t('profile.addressModal.postalCode')}
                                    value={addressForm.postalCode}
                                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                    required
                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-foreground"
                                />
                                <input
                                    type="tel"
                                    placeholder={t('profile.addressModal.phone')}
                                    value={addressForm.phone}
                                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                    required
                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-foreground"
                                />
                            </div>
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })}>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${addressForm.isDefault ? 'bg-foreground border-foreground' : 'border-foreground/20 group-hover:border-foreground'}`}>
                                    {addressForm.isDefault && <FiCheckCircle className="text-background bg-foreground rounded-full" size={14} />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{t('profile.addressModal.setPrimary')}</span>
                            </div>
                            <button type="submit" className="w-full bg-foreground text-background py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-foreground/80 transition-all shadow-lg mt-4">
                                {t('profile.addressModal.save')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
