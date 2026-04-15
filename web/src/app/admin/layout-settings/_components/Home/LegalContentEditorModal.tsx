'use client';

import { useState } from 'react';
import { FiX, FiSave, FiInfo, FiLayout, FiBold, FiItalic, FiList, FiLink, FiCornerUpLeft, FiCornerUpRight, FiType } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateComponentInstance } from '@/lib/slices/componentSlice';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { LegalData } from '@/types/sections';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-foreground/5 border-b border-foreground/10 sticky top-0 z-10">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('bold') ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'}`}
                title="Bold"
            >
                <FiBold size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('italic') ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'}`}
                title="Italic"
            >
                <FiItalic size={16} />
            </button>
            <div className="w-px h-6 bg-foreground/10 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors px-3 text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'}`}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors px-3 text-xs font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'}`}
            >
                H3
            </button>
            <div className="w-px h-6 bg-foreground/10 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('bulletList') ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'}`}
                title="Bullet List"
            >
                <FiList size={16} />
            </button>
            <button
                type="button"
                onClick={setLink}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('link') ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'}`}
                title="Link"
            >
                <FiLink size={16} />
            </button>
            <div className="w-px h-6 bg-foreground/10 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-foreground/10 transition-colors text-foreground/50 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Undo"
            >
                <FiCornerUpLeft size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-foreground/10 transition-colors text-foreground/50 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Redo"
            >
                <FiCornerUpRight size={16} />
            </button>
        </div>
    );
};

interface LegalContentEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
    instanceId?: string;
}

export default function LegalContentEditorModal({ onClose, onUpdate, instanceId }: LegalContentEditorModalProps) {
    const dispatch = useAppDispatch();
    const { instances } = useAppSelector((state) => state.component);

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const instanceData = instance?.data as LegalData | undefined;
    const [formData, setFormData] = useState({
        title: instanceData?.title || 'Legal Information',
        content: instanceData?.content || '<p>Enter your content here...</p>',
        variant: instanceData?.variant || 'standard'
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
        ],
        immediatelyRender: false,
        content: formData.content,
        onUpdate: ({ editor }) => {
            setFormData(prev => ({ ...prev, content: editor.getHTML() }));
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[400px] p-8 max-w-none transition-colors border-none',
            },
        },
    });

    const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');

    const handleModeSwitch = (mode: 'visual' | 'html') => {
        if (mode === 'visual' && editor && editor.getHTML() !== formData.content) {
            editor.commands.setContent(formData.content || '');
        }
        setEditorMode(mode);
    };

    const handleSave = async () => {
        if (!instanceId) return;
        try {
            await dispatch(updateComponentInstance({
                id: instanceId,
                data: formData
            })).unwrap();
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to save legal content:', error);
        }
    };

    const variants = [
        { id: 'standard', name: 'Standard', desc: 'Centered title with wide content area.' },
        { id: 'compact', name: 'Compact', desc: 'Split layout with title on the left.' },
        { id: 'boxed', name: 'Boxed', desc: 'Content wrapped in an elegant card.' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-end">
            <div className="w-full max-w-3xl h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                <div className="p-6 border-b border-foreground/10 flex items-center justify-between bg-foreground/5">
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                            <span className="p-2 bg-foreground text-background rounded-lg"><FiType size={18} /></span>
                            Rich-Text Component Editor
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-10">
                        {/* Title Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FiInfo className="text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">Header Info</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Section Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Enter section title..."
                                />
                            </div>
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FiLayout className="text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">Layout Options</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setFormData({ ...formData, variant: v.id as 'standard' | 'compact' | 'boxed' })}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.variant === v.id
                                            ? 'border-foreground bg-foreground/5 ring-4 ring-foreground/5'
                                            : 'border-foreground/10 hover:border-foreground/30'
                                            }`}
                                    >
                                        <div className="font-bold text-sm mb-1">{v.name}</div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">{v.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <FiBold className="text-primary" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">Main Content</h3>
                                </div>

                                <div className="flex items-center bg-foreground/5 p-1 rounded-lg">
                                    <button
                                        onClick={() => handleModeSwitch('visual')}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${editorMode === 'visual' ? 'bg-background shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground/80'}`}
                                    >
                                        Visual Format
                                    </button>
                                    <button
                                        onClick={() => handleModeSwitch('html')}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${editorMode === 'html' ? 'bg-background shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground/80'}`}
                                    >
                                        HTML Source
                                    </button>
                                </div>
                            </div>

                            <div className="bg-background border border-foreground/10 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
                                {editorMode === 'visual' ? (
                                    <>
                                        <MenuBar editor={editor} />
                                        <div className="bg-foreground/[0.02]">
                                            <EditorContent editor={editor} />
                                        </div>
                                    </>
                                ) : (
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-foreground/[0.02] border-none px-8 py-8 text-sm font-mono focus:outline-none min-h-[464px] leading-relaxed resize-none"
                                        placeholder="<h1>Section Title</h1><p>Your HTML content here...</p>"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-foreground/10 bg-foreground/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-foreground text-background px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
                    >
                        <FiSave size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
