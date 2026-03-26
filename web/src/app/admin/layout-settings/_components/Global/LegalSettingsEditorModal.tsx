'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiInfo, FiCalendar, FiLayout, FiBold, FiItalic, FiList, FiLink, FiCode, FiCornerUpLeft, FiCornerUpRight, FiMinus } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateLegalSettings, LegalSettings, fetchLegalSettings } from '@/lib/slices/contentSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

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
        <div className="flex flex-wrap gap-1 p-2 bg-foreground/5 border-b border-foreground/10">
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
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('strike') ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'} flex items-center justify-center w-[32px] h-[32px]`}
                title="Strikethrough"
            >
                <span className="font-bold font-serif line-through leading-none mt-0.5">S</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('code') ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'}`}
                title="Code"
            >
                <FiCode size={16} />
            </button>
            <div className="w-px h-6 bg-foreground/10 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-foreground/10 transition-colors px-3 text-xs font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-foreground/10 text-foreground' : 'text-foreground/50'}`}
            >
                H1
            </button>
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
            <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="p-2 rounded hover:bg-foreground/10 transition-colors text-foreground/50"
                title="Horizontal Rule"
            >
                <FiMinus size={16} />
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
            <button
                type="button"
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="p-2 rounded hover:bg-red-500/10 text-foreground/40 hover:text-red-500 transition-colors ml-auto"
                title="Clear Formatting"
            >
                Clear
            </button>
        </div>
    );
};

interface LegalSettingsEditorModalProps {
    type: 'privacy_policy' | 'terms_of_service' | 'accessibility';
    onClose: () => void;
    onUpdate: () => void;
}

export default function LegalSettingsEditorModal({ type, onClose, onUpdate }: LegalSettingsEditorModalProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { privacySettings, termsSettings, accessibilitySettings } = useAppSelector((state) => state.content);

    const [formData, setFormData] = useState<LegalSettings>({
        title: '',
        content: '',
        lastUpdated: new Date().toISOString().split('T')[0],
    });

    const pageLabels: Record<string, string> = {
        privacy_policy: t('admin.pages.privacy'),
        terms_of_service: t('admin.pages.terms'),
        accessibility: t('admin.pages.accessibility'),
    };

    useEffect(() => {
        dispatch(fetchLegalSettings({ type }));
    }, [dispatch, type]);

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
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[400px] p-6 max-w-none hover:prose-a:text-blue-500 transition-colors',
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

    useEffect(() => {
        let settings;
        if (type === 'privacy_policy') settings = privacySettings;
        else if (type === 'terms_of_service') settings = termsSettings;
        else if (type === 'accessibility') settings = accessibilitySettings;

        if (settings) {
            setFormData({
                title: settings.title || pageLabels[type],
                content: settings.content || '',
                lastUpdated: settings.lastUpdated || new Date().toISOString().split('T')[0],
            });
            if (editor && settings.content !== editor.getHTML()) {
                editor.commands.setContent(settings.content || '');
            }
        }
    }, [privacySettings, termsSettings, accessibilitySettings, type, editor]);

    const handleSave = async () => {
        try {
            await dispatch(updateLegalSettings({ type, content: formData })).unwrap();
            alert(t('admin.saveSuccess'));
            onUpdate();
            onClose();
        } catch (error) {
            alert(t('admin.saveError'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-end">
            <div 
                className="w-full max-w-2xl h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500"
            >
                {/* Header */}
                <div className="p-6 border-b border-foreground/10 flex items-center justify-between bg-foreground/5">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {t('admin.legal.editTitle', { title: pageLabels[type] })}
                        </h2>
                        <p className="text-xs text-foreground/50">
                            {t('admin.legal.editDesc')}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FiInfo className="text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">
                                {t('admin.legal.pageHeader')}
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1 flex items-center h-4">
                                    {t('admin.legal.pageTitle')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                    placeholder={pageLabels[type]}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1 flex items-center gap-2 h-4">
                                    <FiCalendar size={10} /> {t('admin.legal.lastUpdated')}
                                </label>
                                <input
                                    type="date"
                                    value={formData.lastUpdated}
                                    onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rich Content Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FiLayout className="text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">
                                    {t('admin.legal.pageContent')}
                                </h3>
                            </div>
                            
                            <div className="flex items-center bg-foreground/5 p-1 rounded-lg">
                                <button
                                    onClick={() => handleModeSwitch('visual')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${editorMode === 'visual' ? 'bg-background shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground/80'}`}
                                >
                                    Visual Format
                                </button>
                                <button
                                    onClick={() => handleModeSwitch('html')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${editorMode === 'html' ? 'bg-background shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground/80'}`}
                                >
                                    HTML Source
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">
                                {t('admin.legal.mainBodyContent')}
                            </label>
                            {editorMode === 'visual' ? (
                                <div className="w-full bg-background border border-foreground/10 rounded-xl overflow-hidden shadow-sm">
                                    <MenuBar editor={editor} />
                                    <EditorContent editor={editor} className="bg-foreground/5 min-h-[400px]" />
                                </div>
                            ) : (
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[400px] font-mono leading-relaxed"
                                    placeholder="<h1>Section Title</h1><p>Your HTML content here...</p>"
                                />
                            )}
                            <p className="text-[10px] text-foreground/40 italic">
                                {t('admin.legal.htmlNote')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-foreground/10 bg-foreground/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
                    >
                        {t('admin.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-[var(--primary-color)] text-white px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
                    >
                        <FiSave size={16} /> {t('admin.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
