import { FiMonitor, FiSmartphone, FiGlobe } from 'react-icons/fi';


import { Translate } from '@/hooks/useTranslation';

interface LivePreviewProps {
    t: Translate;
    viewMode: 'desktop' | 'mobile';
    setViewMode: (mode: 'desktop' | 'mobile') => void;
    selectedPage: { path?: string } | null | undefined;
    refreshKey: number;
}

export default function LivePreview({
    t,
    viewMode,
    setViewMode,
    selectedPage,
    refreshKey
}: LivePreviewProps) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const previewUrl = `${origin}${selectedPage?.path}?preview=true`;

    return (
        <div className="flex-1 bg-foreground/5 flex flex-col items-center justify-center p-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

            {/* View Mode Toggle - Floating at Top */}
            <div className="absolute top-1 flex items-center gap-2 bg-background/90 backdrop-blur shadow-sm border border-foreground/20 p-1.5 rounded-lg z-20">
                <button
                    onClick={() => setViewMode('desktop')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'desktop' ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:bg-foreground/10'}`}
                >
                    <FiMonitor size={14} />
                    {t('admin.desktop')}
                </button>
                <button
                    onClick={() => setViewMode('mobile')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'mobile' ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:bg-foreground/10'}`}
                >
                    <FiSmartphone size={14} />
                    {t('admin.mobile')}
                </button>
            </div>

            {/* Browser-like window wrapper */}
            <div className={`bg-background shadow-2xl transition-all duration-500 border border-foreground/20 flex flex-col overflow-hidden relative ${viewMode === 'desktop' ? 'w-[98%] h-[95%] rounded-2xl' : 'w-[375px] h-[780px] rounded-[3rem] border-[8px] border-foreground'}`}>

                {/* Desktop Address Bar (Fake) */}
                {viewMode === 'desktop' && (
                    <div className="bg-foreground/5 border-b border-foreground/10 px-4 py-2 flex items-center gap-4 select-none">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 bg-background border border-foreground/20 rounded-md py-1 px-3 text-[10px] text-foreground/40 flex items-center gap-2 shadow-sm">
                            <FiGlobe size={10} />
                            {`${origin.replace(/^https?:\/\//, '')}${selectedPage?.path}`}
                        </div>
                    </div>
                )}

                {/* Mobile Status Bar (Fake) */}
                {viewMode === 'mobile' && (
                    <div className="h-10 w-full flex items-center justify-between px-8 pt-2">
                        <span className="text-[10px] font-bold">9:41</span>
                        <div className="flex gap-1 items-center">
                            <div className="w-3 h-3 bg-foreground/30 rounded-sm"></div>
                            <div className="w-4 h-2 bg-foreground/30 rounded-sm"></div>
                        </div>
                    </div>
                )}

                {/* IFrame Content */}
                <div className="flex-1 relative overflow-hidden bg-background">
                    {viewMode === 'desktop' ? (
                        <div
                            style={{
                                width: '1280px',
                                height: '133.33%', // 100 / 0.75
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                            }}
                            className="absolute top-0 left-0"
                        >
                            <iframe
                                key={refreshKey}
                                src={previewUrl}
                                className="w-full h-full border-none overflow-x-hidden"
                                title="live-preview"
                            />
                        </div>
                    ) : (
                        <iframe
                            key={refreshKey}
                            src={previewUrl}
                            className="w-full h-full border-none"
                            title="live-preview"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
