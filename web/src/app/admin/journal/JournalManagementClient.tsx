'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useBlogStore } from '@/lib/store/useBlogStore';
import { getErrorMessage } from '@/lib/utils/error';
import type { Blog } from '@/types/blog';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiCalendar } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

interface JournalManagementClientProps {
    initialBlogs?: Blog[];
}

export default function JournalManagementClient({ initialBlogs = [] }: JournalManagementClientProps) {
    const { t } = useTranslation();
    const { blogs: storeBlogs, isLoading: storeLoading, error, fetchBlogs, deleteBlog, bulkDeleteBlogs } = useBlogStore();
    
    const blogs = storeBlogs.length > 0 ? storeBlogs : initialBlogs;
    const isLoading = storeLoading && storeBlogs.length === 0;
    const isDeleting = storeLoading;

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (hasInitialized) {
            fetchBlogs({ q: searchQuery, admin: true });
        } else {
            setHasInitialized(true);
        }
    }, [fetchBlogs, searchQuery, hasInitialized]);

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.content.journal.confirm.delete'))) {
            return;
        }
        try {
            await deleteBlog(id);
            fetchBlogs({ q: searchQuery, admin: true });
        } catch (err: unknown) {
            console.error('Failed to delete blog:', getErrorMessage(err));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedBlogIds.length === 0) return;

        if (confirm(t('admin.content.journal.bulk.confirmDelete', { count: selectedBlogIds.length }))) {
            try {
                await bulkDeleteBlogs(selectedBlogIds);
                setSelectedBlogIds([]);
                fetchBlogs({ q: searchQuery, admin: true });
            } catch (err: unknown) {
                console.error('Failed to bulk delete blogs:', getErrorMessage(err));
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedBlogIds.length === blogs.length) {
            setSelectedBlogIds([]);
        } else {
            setSelectedBlogIds(blogs.map((b) => b._id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedBlogIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.content.journal.title')}</h1>
                    <p className="text-foreground/50 mt-2 font-medium">{t('admin.content.journal.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedBlogIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
                        >
                            <FiTrash2 /> {t('admin.common.selected')}: {selectedBlogIds.length}
                        </button>
                    )}
                    <Link
                        href="/admin/journal/new"
                        className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-foreground/80 transition-all shadow-lg hover:shadow-foreground/20"
                    >
                        <FiPlus size={18} />
                        {t('admin.content.journal.writeButton')}
                    </Link>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-background p-4 rounded-2xl border border-foreground/10 shadow-sm">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('admin.content.journal.searchPlaceholder')}
                        className="w-full pl-12 pr-4 py-3 bg-foreground/5 border-0 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-foreground/5 font-medium transition-all"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/5 text-red-500 rounded-xl border border-red-500/10 flex items-center gap-3">
                    <FiTrash2 size={16} />
                    <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
            )}

            {(isLoading || blogs.length === 0) ? (
                isLoading ? (
                    <div className="flex justify-center py-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-background border border-dashed border-foreground/20 rounded-2xl p-16 text-center">
                        <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6 text-foreground/10">
                            <FiSearch size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{t('admin.content.journal.empty.title')}</h3>
                        <p className="text-foreground/40 text-xs font-medium">{t('admin.content.journal.empty.desc')}</p>
                    </div>
                )
            ) : (
                <div className="bg-background border border-foreground/10 rounded-2xl shadow-sm overflow-hidden text-foreground">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-foreground/5 border-b border-foreground/5 text-foreground/40 font-bold text-[10px] uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 py-5 text-center w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedBlogIds.length === blogs.length && blogs.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                        />
                                    </th>
                                    <th className="px-6 py-5 text-left w-20">{t('admin.content.journal.table.image')}</th>
                                    <th className="px-6 py-5 text-left">{t('admin.content.journal.table.title')}</th>
                                    <th className="px-6 py-5 text-left">{t('admin.content.journal.table.date')}</th>
                                    <th className="px-6 py-5 text-left text-nowrap">{t('admin.content.journal.table.views')}</th>
                                    <th className="px-6 py-5 text-left">{t('admin.content.journal.table.status')}</th>
                                    <th className="px-6 py-5 text-right">{t('admin.content.journal.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {blogs.map((blog) => (
                                    <tr key={blog._id} className={`hover:bg-foreground/5 transition-colors group ${selectedBlogIds.includes(blog._id) ? 'bg-foreground/[0.02]' : ''}`}>
                                        <td className="px-6 py-6 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedBlogIds.includes(blog._id)}
                                                onChange={() => toggleSelect(blog._id)}
                                                className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                            />
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="w-12 h-12 rounded-xl bg-foreground/5 overflow-hidden border border-foreground/10 shadow-sm transition-transform group-hover:scale-110 relative">
                                                {blog.image ? (
                                                    <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-foreground/20 font-black uppercase tracking-tighter opacity-20">NI</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <div className="font-bold text-foreground text-sm leading-tight">{blog.title}</div>
                                            <div className="text-[10px] text-foreground/40 font-medium line-clamp-1 max-w-[200px] mt-0.5">{blog.excerpt}</div>
                                        </td>
                                        <td className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-foreground/40">
                                            <div className="flex items-center gap-2 leading-none">
                                                <FiCalendar size={14} className="opacity-40" />
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-foreground/50 uppercase tracking-widest leading-none">
                                                <FiEye size={16} className="opacity-20 translate-y-[1px]" />
                                                {blog.views || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${blog.isPublished 
                                                ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/5' 
                                                : 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-orange-500/5'
                                                }`}>
                                                <span className={`w-1 h-1 rounded-full ${blog.isPublished ? 'bg-green-600 animate-pulse' : 'bg-orange-600 opacity-60'}`}></span>
                                                {blog.isPublished ? t('admin.content.journal.status.published') : t('admin.content.journal.status.draft')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Link href={`/journal/${blog.slug}`} target="_blank" className="p-2.5 text-foreground/30 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                    <FiEye size={18} />
                                                </Link>
                                                <Link href={`/admin/journal/${blog._id}`} className="p-2.5 text-foreground/30 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-all">
                                                    <FiEdit2 size={18} />
                                                </Link>
                                                <button onClick={() => handleDelete(blog._id)} className="p-2.5 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
