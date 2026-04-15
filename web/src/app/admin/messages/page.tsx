'use client'

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchMessages } from '@/lib/slices/adminSlice';
import { FiMail, FiCalendar, FiUser } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

export default function MessagesPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { messages, loading, error } = useAppSelector((state) => state.admin);
    const isLoading = loading.fetchMessages;

    useEffect(() => {
        dispatch(fetchMessages());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl border border-red-500/20 text-sm font-medium">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.communication.messages.title')}</h1>
                <div className="bg-foreground/5 px-4 py-2 rounded-lg border border-foreground/5 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                    {t('admin.communication.messages.total')}: {messages.length}
                </div>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <div className="text-center py-12 bg-background rounded-2xl border border-dashed border-foreground/20 text-foreground/30 font-bold uppercase tracking-widest text-[10px]">
                        <FiMail className="mx-auto h-12 w-12 opacity-20 mb-4" />
                        <p>{t('admin.communication.messages.empty')}</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id}
                            className="bg-background p-6 rounded-2xl border border-foreground/10 hover:shadow-md transition-all cursor-pointer group hover:bg-foreground/[0.02]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold uppercase text-sm border border-foreground/10 shadow-sm transition-transform group-hover:scale-105">
                                        {message.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{message.subject}</h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                                            <FiUser size={12} className="opacity-50" />
                                            <span>{message.name}</span>
                                            <span className="opacity-20">•</span>
                                            <span className="font-mono lowercase opacity-60 tracking-normal">{message.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30 bg-foreground/5 px-2.5 py-1.5 rounded-lg border border-foreground/5">
                                    <FiCalendar size={12} className="opacity-50" />
                                    <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="pl-13 ml-13">
                                <p className="text-foreground/60 text-sm leading-relaxed border-l-2 border-foreground/10 pl-4 font-medium italic">
                                    &quot;{message.message}&quot;
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border shadow-sm ${message.status === 'new'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    message.status === 'read'
                                        ? 'bg-foreground/5 text-foreground/40 border-foreground/10' :
                                        'bg-primary/10 text-primary border-primary/20'
                                    }`}>
                                    {t(`admin.communication.messages.status.${message.status}`)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
