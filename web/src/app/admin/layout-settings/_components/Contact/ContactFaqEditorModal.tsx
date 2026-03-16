'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateContactSettings } from '@/lib/slices/contentSlice';
import { FiX, FiSave, FiEye, FiEyeOff, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function ContactFaqEditorModal({ onClose, onUpdate }: { onClose: () => void; onUpdate: () => void }) {
    const dispatch = useAppDispatch();
    const { contactSettings } = useAppSelector((state) => state.content);

    const [formData, setFormData] = useState({
        isVisible: true,
        title: '',
        faqs: [] as { question: string; answer: string }[],
        supportText: '',
        supportEmail: '',
        supportPhone: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (contactSettings?.faq) {
            setFormData({
                isVisible: contactSettings.faq.isVisible ?? true,
                title: contactSettings.faq.title || '',
                faqs: contactSettings.faq.faqs || [],
                supportText: contactSettings.faq.supportText || '',
                supportEmail: contactSettings.faq.supportEmail || '',
                supportPhone: contactSettings.faq.supportPhone || '',
            });
        }
    }, [contactSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactSettings) return;

        setIsSaving(true);
        try {
            await dispatch(updateContactSettings({
                ...contactSettings,
                faq: formData
            })).unwrap();
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const addFaq = () => {
        setFormData({
            ...formData,
            faqs: [...formData.faqs, { question: '', answer: '' }]
        });
    };

    const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaqs = [...formData.faqs];
        newFaqs[index][field] = value;
        setFormData({ ...formData, faqs: newFaqs });
    };

    const removeFaq = (index: number) => {
        const newFaqs = [...formData.faqs];
        newFaqs.splice(index, 1);
        setFormData({ ...formData, faqs: newFaqs });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">Contact FAQ Section</h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">Manage FAQs and direct support contact info</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/30">
                    <form onSubmit={handleSave} className="space-y-6 max-w-2xl mx-auto">
                        <div className="bg-background p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-sm">Section Visibility</h4>
                                <p className="text-xs text-muted-foreground/80 mt-1">Show or hide the FAQ area.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${formData.isVisible ? 'bg-green-100 text-green-700' : 'bg-muted/80 text-muted-foreground'}`}
                            >
                                {formData.isVisible ? <><FiEye /> Visible</> : <><FiEyeOff /> Hidden</>}
                            </button>
                        </div>
                        {formData.isVisible && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Side: FAQs */}
                                <div className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">FAQ Title</label>
                                        <input
                                            className="w-full p-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Frequently Asked Questions"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80">Questions</label>
                                            <button type="button" onClick={addFaq} className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:text-blue-700">
                                                <FiPlus /> Add
                                            </button>
                                        </div>
                                        {formData.faqs.map((faq, index) => (
                                            <div key={index} className="p-4 border rounded-xl bg-muted relative group">
                                                <button type="button" onClick={() => removeFaq(index)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiTrash2 size={16} />
                                                </button>
                                                <input
                                                    className="w-full p-2 bg-background border border-border rounded-lg text-sm mb-2 text-foreground focus:outline-none focus:border-primary"
                                                    placeholder="Question"
                                                    value={faq.question}
                                                    onChange={e => updateFaq(index, 'question', e.target.value)}
                                                />
                                                <textarea
                                                    className="w-full p-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                                                    rows={2}
                                                    placeholder="Answer"
                                                    value={faq.answer}
                                                    onChange={e => updateFaq(index, 'answer', e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Right Side: Support Info */}
                                <div className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-6 h-fit">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">Support Block</h4>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Support Text</label>
                                        <input
                                            className="w-full p-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                                            value={formData.supportText}
                                            onChange={e => setFormData({ ...formData, supportText: e.target.value })}
                                            placeholder="Still have questions?"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Support Email</label>
                                        <input
                                            type="email"
                                            className="w-full p-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                                            value={formData.supportEmail}
                                            onChange={e => setFormData({ ...formData, supportEmail: e.target.value })}
                                            placeholder="support@oceangem.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Support Phone</label>
                                        <input
                                            className="w-full p-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                                            value={formData.supportPhone}
                                            onChange={e => setFormData({ ...formData, supportPhone: e.target.value })}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-8 py-3 bg-foreground text-background rounded-xl font-bold shadow-xl hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? 'Saving...' : <><FiSave /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
