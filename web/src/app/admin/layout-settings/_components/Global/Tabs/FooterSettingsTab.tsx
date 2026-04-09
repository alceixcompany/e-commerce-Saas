'use client';

import { GlobalSettings } from '@/types/content';
import { FiList, FiPhone, FiMail, FiGlobe, FiTrash2, FiMenu, FiInfo, FiArrowRight, FiPlus } from 'react-icons/fi';

interface FooterSettingsTabProps {
    settings: GlobalSettings;
    setSettings: (settings: GlobalSettings) => void;
    t: any;
}

export default function FooterSettingsTab({ settings, setSettings, t }: FooterSettingsTabProps) {
    return (
        <div className="space-y-12 animate-in fade-in duration-300 pb-10">
            {/* 0. Footer Layout Selection */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h4 className="text-base font-bold text-foreground flex items-center gap-2 italic">
                            <FiList className="text-primary" /> {t('admin.footerStyle')}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">Choose how your footer columns and brand info are presented.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { id: 'classic', label: 'Classic', desc: 'Centered logo, 3-col grid links.' },
                        { id: 'minimal', label: 'Minimal', desc: 'Sleek horizontal bottom bar.' },
                        { id: 'magazine', label: 'Magazine', desc: 'Large typography & editorial feel.' },
                        { id: 'centered', label: 'Centered', desc: 'Full mathematical symmetry.' }
                    ].map((l) => (
                        <button
                            key={l.id}
                            type="button"
                            onClick={() => setSettings({ ...settings, footerLayout: l.id as any })}
                            className={`p-4 rounded-3xl border-2 text-left transition-all relative overflow-hidden h-full flex flex-col ${settings.footerLayout === l.id ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' : 'border-gray-50 bg-muted/50 hover:bg-background hover:border-border'}`}
                        >
                            <div className="mb-3">
                                {l.id === 'classic' && <div className="w-full h-8 bg-gray-200 rounded flex gap-1 items-center justify-center"><div className="w-4 h-4 bg-background rounded-full" /><div className="flex gap-1"><div className="w-2 h-1 bg-gray-400 rounded" /><div className="w-2 h-1 bg-gray-400 rounded" /></div></div>}
                                {l.id === 'minimal' && <div className="w-full h-8 bg-gray-200 rounded flex items-center justify-between px-2"><div className="w-2 h-2 bg-background rounded-full" /><div className="w-8 h-1 bg-gray-400 rounded" /></div>}
                                {l.id === 'magazine' && <div className="w-full h-8 bg-gray-200 rounded p-2 flex flex-col gap-1 text-[4px] font-serif">Alceix Group<div className="w-6 h-1 bg-gray-400 rounded" /></div>}
                                {l.id === 'centered' && <div className="w-full h-8 bg-gray-200 rounded flex flex-col items-center justify-center gap-1"><div className="w-4 h-1 bg-gray-400 rounded" /><div className="w-6 h-1 bg-gray-400 rounded" /></div>}
                            </div>
                            <span className="text-xs font-bold text-foreground mb-1">{l.label}</span>
                            <p className="text-[10px] text-muted-foreground/80 leading-tight flex-1">{l.desc}</p>
                            {settings.footerLayout === l.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
                        </button>
                    ))}
                </div>
            </section>

            {/* 1. Contact Info Section */}
            <div className="space-y-4">
                <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                    <FiPhone className="text-muted-foreground/80" /> {t('admin.contactInfo')}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.supportEmail')}</label>
                        <input value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="support@example.com" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.phoneNumber')}</label>
                        <input value={settings.contactPhone} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="+1 (555) 000-0000" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.physicalAddress')}</label>
                    <textarea rows={2} value={settings.contactAddress} onChange={e => setSettings({ ...settings, contactAddress: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm resize-none" placeholder="123 Store Street..." />
                </div>
            </div>

            {/* 2. Newsletter Section */}
            <div className="space-y-4">
                <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                    <FiMail className="text-muted-foreground/80" /> {t('admin.newsletterSettings')}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.heading')}</label>
                        <input value={settings.newsletterTitle || ''} onChange={e => setSettings({ ...settings, newsletterTitle: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="Join the Inner Circle" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.description')}</label>
                        <input value={settings.newsletterDescription || ''} onChange={e => setSettings({ ...settings, newsletterDescription: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="Unlock exclusive access..." />
                    </div>
                </div>
            </div>

            {/* 3. Social Media Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-end border-b pb-2">
                    <h4 className="font-bold text-sm flex items-center gap-2"><FiGlobe className="text-muted-foreground/80" /> {t('admin.socialMediaLinks')}</h4>
                    <button
                        type="button"
                        onClick={() => setSettings({
                            ...settings,
                            socialLinks: [...(settings.socialLinks || []), { platform: 'New Platform', url: 'https://' }]
                        })}
                        className="text-[10px] font-bold bg-muted/80 hover:bg-foreground hover:text-background px-2 py-1 rounded transition-colors"
                    >
                        {t('admin.addSocial')}
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
                                    placeholder="Name (e.g. Instagram)"
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
                                    placeholder="Profile URL (https://...)"
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
            </div>

            {/* 4. Footer Columns Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-end border-b pb-2">
                    <div>
                        <h4 className="font-bold text-sm flex items-center gap-2"><FiMenu className="text-muted-foreground/80" /> {t('admin.footerLinkGroups')}</h4>
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5">Organize links into columns (e.g. 'Help', 'Legal')</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSettings({
                            ...settings,
                            footerColumns: [...(settings.footerColumns || []), { title: 'New Group', links: [] }]
                        })}
                        className="text-[10px] font-bold bg-foreground text-background px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                    >
                        {t('admin.addGroup')}
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
                                    <label className="text-[9px] font-bold uppercase text-muted-foreground/80 ml-1">{t('admin.groupTitle')}</label>
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
                                    <FiPlus size={12} /> {t('admin.addLink')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
