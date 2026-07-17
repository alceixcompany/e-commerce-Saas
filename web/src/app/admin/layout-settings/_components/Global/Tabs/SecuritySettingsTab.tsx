'use client';

import { FiAlertTriangle, FiShield } from 'react-icons/fi';

import { Translate } from '@/hooks/useTranslation';
import { GlobalSettings } from '@/types/content';

interface SecuritySettingsTabProps {
    settings: GlobalSettings;
    setSettings: (settings: GlobalSettings) => void;
    t: Translate;
}

export default function SecuritySettingsTab({ settings, setSettings, t }: SecuritySettingsTabProps) {
    const isEnabled = settings.sessionVerificationEnabled !== false;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl border border-border/50 shadow-xl bg-muted/5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-background border border-foreground/5 shadow-inner flex items-center justify-center shrink-0">
                    <FiShield size={24} className="text-primary" />
                </div>
                <div>
                    <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2 block">
                        {t('admin.globalSettings.security.title')}
                    </span>
                    <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">
                        {t('admin.globalSettings.security.sessionVerification')}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('admin.globalSettings.security.sessionVerificationDescription')}
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border p-6 flex items-center justify-between gap-6 bg-background">
                <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground">
                        {t('admin.globalSettings.security.sessionVerification')}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed max-w-lg">
                        {isEnabled
                            ? t('admin.globalSettings.security.enabledHint')
                            : t('admin.globalSettings.security.disabledHint')}
                    </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isEnabled}
                        onChange={(event) => setSettings({
                            ...settings,
                            sessionVerificationEnabled: event.target.checked,
                        })}
                    />
                    <div className="w-14 h-7 bg-foreground/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border after:border-foreground/10 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-foreground" />
                </label>
            </div>

            {!isEnabled && (
                <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-700 flex gap-4">
                    <FiAlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed font-medium">
                        {t('admin.globalSettings.security.disabledWarning')}
                    </p>
                </div>
            )}
        </div>
    );
}
