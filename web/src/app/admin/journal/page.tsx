'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchAllBlogs, deleteBlog } from '@/lib/slices/blogSlice';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiCalendar } from 'react-icons/fi';

export default function AdminJournalPage() {
    const dispatch = useAppDispatch();
    const { blogs, isLoading, error } = useAppSelector((state) => state.blog);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        dispatch(fetchAllBlogs({ q: searchQuery }));
    }, [dispatch, searchQuery]);

    // Blogs are now searched by the backend
    const displayBlogs = blogs;

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this story?')) {
            return;
        }
        dispatch(deleteBlog(id));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Journal</h1>
                    <p className="text-foreground/50 mt-2">Manage your blog stories</p>
                </div>
                <Link
                    href="/admin/journal/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-bold uppercase tracking-widest text-[10px] hover:bg-foreground/80 transition-all rounded-lg shadow-sm hover:shadow-md"
                >
                    <FiPlus size={18} />
                    Write Story
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-background p-4 rounded-xl border border-foreground/10 shadow-sm">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search stories..."
                        className="w-full pl-10 pr-4 py-2.5 bg-foreground/5 border-0 rounded-lg text-sm text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-foreground/5"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground"></div>
                </div>
            ) : displayBlogs.length === 0 ? (
                <div className="bg-background border border-dashed border-foreground/20 rounded-xl p-12 text-center text-foreground/40 font-bold uppercase tracking-widest text-[10px]">
                    <h3 className="text-lg font-bold text-foreground mb-1">No stories found</h3>
                    <p className="opacity-50">Start writing your first journal entry.</p>
                </div>
            ) : (
                <div className="bg-background border border-foreground/10 rounded-xl shadow-sm overflow-hidden text-foreground">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-foreground/5 border-b border-foreground/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest w-20">Image</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Title</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Views</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {displayBlogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-foreground/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-foreground/5 overflow-hidden border border-foreground/10">
                                                {blog.image ? (
                                                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-foreground/20 font-bold uppercase tracking-tighter">No Img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{blog.title}</div>
                                            <div className="text-[10px] text-foreground/40 font-medium line-clamp-1 max-w-[200px]">{blog.excerpt}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar />
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                                                <FiEye size={14} className="opacity-30" />
                                                {blog.views || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${blog.isPublished 
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                }`}>
                                                {blog.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/journal/${blog.slug}`} target="_blank" className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all">
                                                    <FiEye size={16} />
                                                </Link>
                                                <Link href={`/admin/journal/${blog._id}`} className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all">
                                                    <FiEdit2 size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(blog._id)} className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                                    <FiTrash2 size={16} />
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
