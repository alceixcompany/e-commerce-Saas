'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createBlog, updateBlog, fetchBlogBySlug } from '@/lib/slices/blogSlice';
import api from '@/lib/api';
import { FiArrowLeft, FiSave, FiImage, FiType, FiAlignLeft, FiUpload, FiBold, FiItalic, FiList, FiLink } from 'react-icons/fi';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface BlogEditorProps {
    id?: string; // If present, edit mode
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-500'}`}
                title="Bold"
            >
                <FiBold size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-500'}`}
                title="Italic"
            >
                <FiItalic size={16} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors px-3 text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-500'}`}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors px-3 text-xs font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-black' : 'text-gray-500'}`}
            >
                H3
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-500'}`}
                title="Bullet List"
            >
                <FiList size={16} />
            </button>
            <button
                type="button"
                onClick={setLink}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('link') ? 'bg-gray-200 text-black' : 'text-gray-500'}`}
                title="Link"
            >
                <FiLink size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-auto"
                title="Clear Formatting"
            >
                Clear
            </button>
        </div>
    );
};

export default function BlogEditor({ id }: BlogEditorProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { blog, isLoading: isBlogLoading } = useAppSelector((state) => state.blog);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        tags: '',
        isPublished: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
        ],
        content: '',
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            setFormData(prev => ({ ...prev, content: editor.getHTML() }));
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] p-6 max-w-none hover:prose-a:text-blue-800 transition-colors',
            },
        },
    });

    useEffect(() => {
        if (id) {
            dispatch(fetchBlogBySlug(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (id && blog) {
            setFormData({
                title: blog.title || '',
                excerpt: blog.excerpt || '',
                content: blog.content || '',
                image: blog.image || '',
                tags: blog.tags?.join(', ') || '',
                isPublished: blog.isPublished || false
            });
            if (editor && blog.content) {
                editor.commands.setContent(blog.content);
            }
        }
    }, [id, blog, editor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        try {
            if (id) {
                await dispatch(updateBlog({ id, data: payload })).unwrap();
            } else {
                await dispatch(createBlog(payload)).unwrap();
            }
            router.push('/admin/journal');
        } catch (err) {
            console.error('Failed to save story:', err);
            alert('Failed to save story');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (id && isBlogLoading && !blog) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors uppercase text-[10px] font-bold tracking-widest">
                    <FiArrowLeft /> Back
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{id ? 'Edit Story' : 'New Story'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <FiType /> Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full text-3xl font-serif border-0 border-b border-gray-100 focus:border-black focus:ring-0 px-0 py-4 placeholder:text-gray-200 transition-all font-light"
                            placeholder="Enter story title..."
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            Summary
                        </label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            required
                            rows={2}
                            className="w-full border border-gray-100 rounded-lg p-4 focus:border-black focus:ring-0 transition-all text-sm text-gray-600 font-light resize-none"
                            placeholder="A short summary of the story..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <FiImage /> Cover Image
                        </label>
                        <div className="border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                            {formData.image ? (
                                <div className="space-y-4">
                                    <div className="aspect-[21/9] bg-white rounded-lg overflow-hidden border border-gray-100 relative group">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-black hover:text-white transition-all shadow-xl"
                                            >
                                                Replace Image
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-200 rounded-lg p-10 text-center hover:border-black hover:bg-white transition-all group bg-white/50">
                                    {uploadingImage ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Uploading...</p>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                                                <FiUpload size={20} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Upload Cover Image</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">JPG, PNG • High Resolution</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    setUploadingImage(true);
                                                    const data = new FormData();
                                                    data.append('image', file);

                                                    try {
                                                        const res = await api.post('/upload/image', data, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        const imageUrl = res.data.data.url.startsWith('http')
                                                            ? res.data.data.url
                                                            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${res.data.data.url}`;

                                                        setFormData(prev => ({ ...prev, image: imageUrl }));
                                                    } catch (err) {
                                                        console.error('Upload failed:', err);
                                                        alert('Failed to upload image');
                                                    } finally {
                                                        setUploadingImage(false);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <FiAlignLeft /> Story Content
                        </label>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-100">
                            <MenuBar editor={editor} />
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    {/* Tags & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Filter Tags</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full border border-gray-100 rounded-lg p-3 focus:border-black focus:ring-0 transition-all text-sm font-light bg-gray-50/50"
                                placeholder="Design, Luxury, Craftsmanship..."
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-50">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Publish immediately</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleCheckboxChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                            </label>
                        </div>
                    </div>

                </div>

                <div className="flex justify-end gap-3 flex-col sm:flex-row">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-4 border border-gray-200 rounded-sm font-bold text-gray-400 hover:text-black hover:border-black transition-all uppercase text-[10px] tracking-widest"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-10 py-4 bg-black text-white rounded-sm font-bold hover:bg-zinc-800 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10"
                    >
                        <FiSave size={14} />
                        {isSubmitting ? 'Saving Story...' : 'Publish Story'}
                    </button>
                </div>
            </form>
        </div>
    );
}
