'use client';

import { useEffect } from 'react';
import { GlobalSettings } from '@/types/content';
import { FiList, FiPhone, FiMail, FiGlobe, FiTrash2, FiMenu, FiArrowRight, FiPlus, FiCheckCircle, FiEye, FiFileText } from 'react-icons/fi';
import { Translate } from '@/hooks/useTranslation';
import { REQUIRED_FOOTER_COLUMNS } from '@/config/footer.config';

interface FooterSettingsTabProps {
    settings: GlobalSettings;
    setSettings: (settings: GlobalSettings) => void;
    t: Translate;
}

export default function FooterSettingsTab({ settings, setSettings, t }: FooterSettingsTabProps) {
    const selectedLayout = settings.footerLayout || 'classic';
    const showContact = settings.footerShowContact
        ?? Boolean(settings.contactEmail || settings.contactPhone || settings.contactAddress);
    const showNewsletter = settings.footerShowNewsletter
        ?? Boolean(settings.newsletterTitle || settings.newsletterDescription);
    const showSocialLinks = settings.footerShowSocialLinks ?? Boolean(settings.socialLinks?.length);

    useEffect(() => {
        if (!settings.footerColumns || settings.footerColumns.length === 0) {
            setSettings({
                ...settings,
                footerColumns: REQUIRED_FOOTER_COLUMNS.map((column) => ({
                    ...column,
                    links: column.links.map((link) => ({ ...link })),
                })),
            });
        }
    }, [settings, setSettings]);

    const layoutNotes: Record<NonNullable<GlobalSettings['footerLayout']>, string> = {
        classic: 'Logo üstte; bağlantı grupları sütunlar hâlinde, iletişim ve bülten alanları altta gösterilir.',
        minimal: 'Logo ve tüm bağlantılar kompakt yatay alanda gösterilir. Link sayısı artık sınırlandırılmaz.',
        magazine: 'Marka ve iletişim solda, bağlantı grupları ortada, bülten ve sosyal bağlantılar sağda gösterilir.',
        centered: 'Logo, bağlantı grupları, iletişim ve bülten alanları simetrik ve ortalanmış gösterilir.',
    };

    const toggleSetting = (key: 'footerShowContact' | 'footerShowNewsletter' | 'footerShowSocialLinks', value: boolean) => {
        setSettings({ ...settings, [key]: value });
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-300 pb-10">
            {/* 0. Footer Layout Selection */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h4 className="text-base font-bold text-foreground flex items-center gap-2 italic">
                            <FiList className="text-primary" /> {t('admin.globalSettings.footer.footerStyle')}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{t('admin.globalSettings.footer.footerStyleDesc')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { id: 'classic', label: t('admin.globalSettings.footer.layouts.classic'), desc: t('admin.globalSettings.footer.layouts.classicDesc') },
                        { id: 'minimal', label: t('admin.globalSettings.footer.layouts.minimal'), desc: t('admin.globalSettings.footer.layouts.minimalDesc') },
                        { id: 'magazine', label: t('admin.globalSettings.footer.layouts.magazine'), desc: t('admin.globalSettings.footer.layouts.magazineDesc') },
                        { id: 'centered', label: t('admin.globalSettings.footer.layouts.centered'), desc: t('admin.globalSettings.footer.layouts.centeredDesc') }
                    ].map((l) => (
                        <button
                            key={l.id}
                            type="button"
                            onClick={() => setSettings({ ...settings, footerLayout: l.id as 'centered' | 'minimal' | 'classic' | 'magazine' | undefined })}
                            className={`p-4 rounded-3xl border-2 text-left transition-all relative overflow-hidden h-full flex flex-col ${settings.footerLayout === l.id ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' : 'border-gray-50 bg-muted/50 hover:bg-background hover:border-border'}`}
                        >
                            <div className="mb-3">
                                {l.id === 'classic' && <div className="w-full h-8 bg-gray-200 rounded flex gap-1 items-center justify-center"><div className="w-4 h-4 bg-background rounded-full" /><div className="flex gap-1"><div className="w-2 h-1 bg-gray-400 rounded" /><div className="w-2 h-1 bg-gray-400 rounded" /></div></div>}
                                {l.id === 'minimal' && <div className="w-full h-8 bg-gray-200 rounded items-center justify-between px-2 flex"><div className="w-2 h-2 bg-background rounded-full" /><div className="w-8 h-1 bg-gray-400 rounded" /></div>}
                                {l.id === 'magazine' && <div className="w-full h-8 bg-gray-200 rounded p-2 flex flex-col gap-1 text-[4px] font-serif">Alceix Group<div className="w-6 h-1 bg-gray-400 rounded" /></div>}
                                {l.id === 'centered' && <div className="w-full h-8 bg-gray-200 rounded flex flex-col items-center justify-center gap-1"><div className="w-4 h-1 bg-gray-400 rounded" /><div className="w-6 h-1 bg-gray-400 rounded" /></div>}
                            </div>
                            <span className="text-xs font-bold text-foreground mb-1">{l.label}</span>
                            <p className="text-[10px] text-muted-foreground/80 leading-tight flex-1">{l.desc}</p>
                            {settings.footerLayout === l.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
                        </button>
                    ))}
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                    <FiEye className="text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-foreground">Seçili düzen: {selectedLayout}</p>
                        <p className="text-[11px] leading-relaxed text-muted-foreground mt-1">{layoutNotes[selectedLayout]}</p>
                        <p className="text-[10px] font-medium text-primary mt-2">iyzico ile Öde, Visa ve Mastercard logoları her düzende otomatik ve kalıcıdır.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-5">
                <div className="border-b border-border pb-3">
                    <h4 className="font-bold text-sm flex items-center gap-2"><FiFileText className="text-muted-foreground/80" /> Marka ve Alt Bilgi</h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Telif metninde <code>{'{year}'}</code> kullanırsanız yıl otomatik güncellenir.</p>
                </div>
                {selectedLayout === 'magazine' && (
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Footer Sloganı</label>
                        <input value={settings.tagline || ''} onChange={e => setSettings({ ...settings, tagline: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="Markanızın kısa açıklaması" />
                    </div>
                )}
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Telif Hakkı Metni</label>
                    <input value={settings.footerText || ''} onChange={e => setSettings({ ...settings, footerText: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="© {year} Mağaza Adı. Tüm hakları saklıdır." />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                    {[
                        { key: 'footerShowContact' as const, label: 'İletişim', value: showContact },
                        { key: 'footerShowNewsletter' as const, label: 'Bülten', value: showNewsletter },
                        { key: 'footerShowSocialLinks' as const, label: 'Sosyal Medya', value: showSocialLinks },
                    ].map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => toggleSetting(option.key, !option.value)}
                            className={`flex items-center justify-between rounded-xl border px-3 py-3 text-xs font-bold transition-colors ${option.value ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border bg-muted/30 text-muted-foreground'}`}
                        >
                            {option.label}
                            <FiCheckCircle className={option.value ? 'text-primary' : 'opacity-20'} />
                        </button>
                    ))}
                </div>
            </section>

            {/* 1. Contact Info Section */}
            {showContact && <div className="space-y-4">
                <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                    <FiPhone className="text-muted-foreground/80" /> {t('admin.globalSettings.footer.contactInfo')}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.footer.supportEmail')}</label>
                        <input value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="support@example.com" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.footer.phoneNumber')}</label>
                        <input value={settings.contactPhone} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="+1 (555) 000-0000" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.footer.physicalAddress')}</label>
                    <textarea rows={2} value={settings.contactAddress} onChange={e => setSettings({ ...settings, contactAddress: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm resize-none" placeholder="123 Store Street..." />
                </div>
            </div>}

            {/* 2. Newsletter Section */}
            {showNewsletter && <div className="space-y-4">
                <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                    <FiMail className="text-muted-foreground/80" /> {t('admin.globalSettings.footer.newsletter')}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.footer.heading')}</label>
                        <input value={settings.newsletterTitle || ''} onChange={e => setSettings({ ...settings, newsletterTitle: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="Join the Inner Circle" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.description')}</label>
                        <input value={settings.newsletterDescription || ''} onChange={e => setSettings({ ...settings, newsletterDescription: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="Unlock exclusive access..." />
                    </div>
                </div>
            </div>}

            {/* 3. Social Media Section */}
            {showSocialLinks && <div className="space-y-4">
                <div className="flex justify-between items-end border-b pb-2">
                    <h4 className="font-bold text-sm flex items-center gap-2"><FiGlobe className="text-muted-foreground/80" /> {t('admin.globalSettings.footer.socialMedia')}</h4>
                    <button
                        type="button"
                        onClick={() => setSettings({
                            ...settings,
                            socialLinks: [...(settings.socialLinks || []), { platform: 'New Platform', url: 'https://' }]
                        })}
                        className="text-[10px] font-bold bg-muted/80 hover:bg-foreground hover:text-background px-2 py-1 rounded transition-colors"
                    >
                        {t('admin.globalSettings.footer.addSocial')}
                    </button>
                </div>
                <div className="space-y-2">
                    {(!settings.socialLinks || settings.socialLinks.length === 0) && (
                        <p className="text-xs text-muted-foreground/80 italic">No social links added.</p>
                    )}
                    {settings.socialLinks?.map((social, index) => (
                        <div key={index} className="flex gap-2 items-center group">
                            <div className="w-1/3">
                                <input
                                    value={social.platform}
                                    onChange={(e) => {
                                        const newLinks = (settings.socialLinks || []).map((lnk, i) =>
                                            i === index ? { ...lnk, platform: e.target.value } : lnk
                                        );
                                        setSettings({ ...settings, socialLinks: newLinks });
                                    }}
                                    className="w-full p-2 border border-border rounded-lg text-xs focus:ring-1 focus:ring-black focus:border-foreground transition-all"
                                    placeholder={t('admin.globalSettings.footer.platformPlaceholder')}
                                    title="Platform Name"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    value={social.url}
                                    onChange={(e) => {
                                        const newLinks = (settings.socialLinks || []).map((lnk, i) =>
                                            i === index ? { ...lnk, url: e.target.value } : lnk
                                        );
                                        setSettings({ ...settings, socialLinks: newLinks });
                                    }}
                                    className="w-full p-2 border border-border rounded-lg text-xs text-blue-600 font-mono focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder={t('admin.globalSettings.footer.urlPlaceholder')}
                                    title="Profile Link URL"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const newLinks = settings.socialLinks?.filter((_, i) => i !== index);
                                    setSettings({ ...settings, socialLinks: newLinks });
                                }}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove Social Link"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>}

            {/* 4. Footer Columns Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-end border-b pb-2">
                    <div>
                        <h4 className="font-bold text-sm flex items-center gap-2"><FiMenu className="text-muted-foreground/80" /> {t('admin.globalSettings.footer.linkGroups')}</h4>
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5">{t('admin.globalSettings.footer.linkGroupsDesc')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSettings({
                            ...settings,
                            footerColumns: [...(settings.footerColumns || []), { title: 'New Group', links: [] }]
                        })}
                        className="text-[10px] font-bold bg-foreground text-background px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                    >
                        {t('admin.globalSettings.footer.addGroup')}
                    </button>
                </div>

                {(!settings.footerColumns || settings.footerColumns.length === 0) && (
                    <div className="text-center py-8 bg-muted rounded-xl border border-dashed border-border">
                        <p className="text-xs text-muted-foreground/80">No link groups created yet.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settings.footerColumns?.map((column, colIndex) => (
                        <div key={colIndex} className="p-6 border border-border rounded-3xl bg-background shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <div className="space-y-1 flex-1 mr-4">
                                    <label className="text-[9px] font-bold uppercase text-muted-foreground/80 ml-1">{t('admin.globalSettings.footer.groupTitle')}</label>
                                    <input
                                        value={column.title}
                                        onChange={(e) => {
                                            const newCols = [...(settings.footerColumns || [])];
                                            newCols[colIndex] = { ...column, title: e.target.value };
                                            setSettings({ ...settings, footerColumns: newCols });
                                        }}
                                        className="w-full bg-transparent text-sm font-bold focus:outline-none border-b border-transparent focus:border-foreground transition-all"
                                        placeholder="Help Center"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newCols = settings.footerColumns?.filter((_, i) => i !== colIndex);
                                        setSettings({ ...settings, footerColumns: newCols });
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500 rounded-xl transition-all"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {column.links.map((link, linkIndex) => (
                                    <div key={linkIndex} className="flex gap-2 items-center group/link">
                                        <div className="flex-1 space-y-2 p-3 bg-muted/30 rounded-2xl group-hover/link:bg-muted/50 transition-colors">
                                            <input
                                                value={link.label}
                                                onChange={(e) => {
                                                    const newCols = [...(settings.footerColumns || [])];
                                                    const newLinks = [...column.links];
                                                    newLinks[linkIndex] = { ...link, label: e.target.value };
                                                    newCols[colIndex] = { ...column, links: newLinks };
                                                    setSettings({ ...settings, footerColumns: newCols });
                                                }}
                                                className="w-full bg-transparent text-xs font-bold focus:outline-none border-b border-transparent focus:border-foreground"
                                                placeholder="Label"
                                            />
                                            <div className="flex items-center gap-2">
                                                <FiArrowRight className="text-gray-300" size={10} />
                                                <input
                                                    value={link.path}
                                                    onChange={(e) => {
                                                        const newCols = [...(settings.footerColumns || [])];
                                                        const newLinks = [...column.links];
                                                        newLinks[linkIndex] = { ...link, path: e.target.value };
                                                        newCols[colIndex] = { ...column, links: newLinks };
                                                        setSettings({ ...settings, footerColumns: newCols });
                                                    }}
                                                    className="w-full bg-transparent text-[10px] font-mono text-blue-600 focus:outline-none"
                                                    placeholder="/path"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newCols = [...(settings.footerColumns || [])];
                                                const newLinks = column.links.filter((_, i) => i !== linkIndex);
                                                newCols[colIndex] = { ...column, links: newLinks };
                                                setSettings({ ...settings, footerColumns: newCols });
                                            }}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover/link:opacity-100"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newCols = [...(settings.footerColumns || [])];
                                        const newLinks = [...column.links, { label: 'New Link', path: '/' }];
                                        newCols[colIndex] = { ...column, links: newLinks };
                                        setSettings({ ...settings, footerColumns: newCols });
                                    }}
                                    className="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-border rounded-2xl text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all"
                                >
                                    <FiPlus size={12} /> {t('admin.globalSettings.footer.addLink')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
