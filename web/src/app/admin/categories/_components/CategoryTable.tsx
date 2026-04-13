import { FiEdit2, FiTrash2, FiEye, FiImage } from 'react-icons/fi';
import Link from 'next/link';
import { Category } from '@/types/category';
import { useTranslation } from '@/hooks/useTranslation';

interface CategoryTableProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
    selectedIds?: string[];
    onToggleSelect?: (id: string) => void;
    onToggleSelectAll?: () => void;
}

export default function CategoryTable({
    categories,
    onEdit,
    onDelete,
    isLoading = false,
    selectedIds = [],
    onToggleSelect,
    onToggleSelectAll
}: CategoryTableProps) {
    const { t } = useTranslation();

    if (isLoading && categories.length === 0) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground mx-auto"></div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="bg-background border border-dashed border-foreground/20 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 text-foreground/20">
                    <FiImage size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{t('admin.catalog.categories.table.noCategories')}</h3>
                <p className="text-foreground/50 mb-6 max-w-sm mx-auto">
                    {t('admin.catalog.categories.table.noCategoriesDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-background border border-foreground/10 rounded-xl shadow-sm overflow-hidden mb-2">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-foreground/5 border-b border-foreground/5 text-foreground/40 font-bold text-[10px] uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-6 py-4 text-center w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === categories.length && categories.length > 0}
                                    onChange={onToggleSelectAll}
                                    className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                />
                            </th>
                            <th className="px-6 py-4 text-left w-24">{t('admin.catalog.categories.table.image')}</th>
                            <th className="px-6 py-4 text-left">{t('admin.catalog.categories.table.name')}</th>
                            <th className="px-6 py-4 text-left">{t('admin.catalog.categories.table.slug')}</th>
                            <th className="px-6 py-4 text-left">{t('admin.catalog.categories.table.status')}</th>
                            <th className="px-6 py-4 text-left">{t('admin.catalog.categories.table.created')}</th>
                            <th className="px-6 py-4 text-right">{t('admin.catalog.categories.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/5">
                        {categories.filter(cat => cat && cat._id).map((category) => (
                            <tr key={category._id} className={`hover:bg-foreground/5 transition-colors group ${selectedIds.includes(category._id) ? 'bg-foreground/[0.02]' : ''}`}>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(category._id)}
                                        onChange={() => onToggleSelect?.(category._id)}
                                        className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-12 h-12 rounded-xl bg-foreground/5 overflow-hidden border border-foreground/10 shadow-sm transition-transform group-hover:scale-110">
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-foreground/10">
                                                <FiImage size={24} className="opacity-40" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-foreground leading-tight">{category.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-[10px] font-mono font-bold tracking-tight text-foreground/40 bg-foreground/5 px-2 py-1 rounded-md w-fit border border-foreground/5 uppercase">{category.slug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${category.status === 'active'
                                        ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/5'
                                        : 'bg-foreground/5 text-foreground/40 border-foreground/10'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${category.status === 'active' ? 'bg-green-600 animate-pulse' : 'bg-foreground/30'}`}></span>
                                        {category.status === 'active' ? t('admin.catalog.categories.table.active') : t('admin.catalog.categories.table.inactive')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <Link
                                            href={`/categories/${category.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 text-foreground/30 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                            title={t('admin.catalog.categories.table.viewOnSite')}
                                        >
                                            <FiEye size={18} />
                                        </Link>
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="p-2.5 text-foreground/30 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-all"
                                            title={t('admin.common.edit')}
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(category._id)}
                                            className="p-2.5 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            title={t('admin.common.delete')}
                                        >
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
    );
}
