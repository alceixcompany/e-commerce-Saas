'use client';

import { FiUser, FiPhone, FiMail, FiCreditCard, FiEdit3 } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

interface TabAccountProps {
    profile: any;
    profileForm: any;
    setProfileForm: (form: any) => void;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    handleUpdate: (e: React.FormEvent) => void;
}

export default function TabAccount({
    profile,
    profileForm,
    setProfileForm,
    isEditing,
    setIsEditing,
    handleUpdate
}: TabAccountProps) {
    const { t } = useTranslation();
    return (
        <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-8 md:mb-12">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">{t('profile.tabs.account.title')}</h2>
                    <p className="text-xs text-foreground/40 mt-1 uppercase tracking-widest font-medium">{t('profile.tabs.account.titleDesc')}</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-foreground/5 text-foreground rounded-xl text-xs font-bold transition-all hover:bg-foreground hover:text-background"
                    >
                        <FiEdit3 size={14} /> {t('profile.tabs.account.edit')}
                    </button>
                )}
            </div>

            <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                        <FiUser className="text-primary" /> {t('profile.tabs.account.fullName')}
                    </label>
                    <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
                        placeholder={t('profile.tabs.account.namePlaceholder')}
                    />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                        <FiPhone className="text-primary" /> {t('profile.tabs.account.phone')}
                    </label>
                    <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
                        placeholder={t('profile.tabs.account.phonePlaceholder')}
                    />
                </div>



                {/* Email (Read Only) */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                        <FiMail className="text-primary" /> {t('profile.tabs.account.email')}
                    </label>
                    <div className="w-full bg-foreground/[0.02] border border-foreground/5 rounded-2xl px-5 py-4 text-sm text-foreground/30 font-mono italic">
                        {profile?.email}
                    </div>
                </div>

                {isEditing && (
                    <div className="md:col-span-2 pt-6 flex gap-4">
                        <button 
                            type="submit" 
                            className="flex-1 bg-foreground text-background px-8 py-4 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all rounded-2xl shadow-xl shadow-foreground/10"
                        >
                            {t('profile.tabs.account.save')}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)} 
                            className="px-8 py-4 border border-foreground/10 text-foreground/60 text-xs font-bold tracking-widest uppercase hover:bg-foreground/5 transition-all rounded-2xl"
                        >
                            {t('profile.tabs.account.cancel')}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
