import { FiX, FiCheck } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

interface CategoryFormProps {
    editingId: string | null;
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setManualField: (name: string, value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleCancelEdit: () => void;
    isLoading: boolean;
}

export default function CategoryForm({
    editingId,
    formData,
    handleChange,
    setManualField,
    handleSubmit,
    handleCancelEdit,
    isLoading
}: CategoryFormProps) {
    return (
        <div className="bg-background border border-foreground/10 rounded-xl shadow-sm p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-foreground/10">
                <h2 className="text-lg font-bold text-foreground">
                    {editingId ? 'Edit Category' : 'Create New Category'}
                </h2>
                <button onClick={handleCancelEdit} className="text-foreground/40 hover:text-foreground p-1 rounded-full hover:bg-foreground/5 transition-colors">
                    <FiX size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground/70 mb-1">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all placeholder:text-foreground/30"
                                placeholder="e.g. Living Room"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/70 mb-1">
                                URL Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground/60 focus:outline-none focus:border-foreground/20 transition-all font-mono"
                                placeholder="living-room"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/70 mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <ImageUpload
                                label="Category Thumbnail"
                                value={formData.image}
                                onChange={(url) => setManualField('image', url)}
                                onRemove={() => setManualField('image', '')}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-foreground/10">
                    <div>
                        <ImageUpload
                            label="Banner Image (Optional)"
                            value={formData.bannerImage}
                            onChange={(url) => setManualField('bannerImage', url)}
                            onRemove={() => setManualField('bannerImage', '')}
                            isBanner={true}
                        />
                        <p className="mt-2 text-xs text-foreground/40">
                            Displayed at the top of the category page. Recommended size: 1920x400px.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-foreground/10 text-foreground/70 text-sm font-medium hover:bg-foreground/5 transition-colors rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                        ) : (
                            <FiCheck size={16} />
                        )}
                        {editingId ? 'Update Category' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    );
}
