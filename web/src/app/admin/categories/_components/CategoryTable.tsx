import { FiEdit2, FiTrash2, FiEye, FiImage } from 'react-icons/fi';
import Link from 'next/link';
import { Category } from '@/types/category';
import { useTranslation } from '@/hooks/useTranslation';

interface CategoryTableProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
}

export default function CategoryTable({
    categories,
    onEdit,
    onDelete,
    isLoading = false
}: CategoryTableProps) {
    const { t } = useTranslation();

    if (isLoading && categories.length === 0) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground"></div>
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
        <div className="bg-background border border-foreground/10 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-foreground/5 border-b border-foreground/5">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider w-24">{t('admin.catalog.categories.table.image')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('admin.catalog.categories.table.name')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('admin.catalog.categories.table.slug')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('admin.catalog.categories.table.status')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('admin.catalog.categories.table.created')}</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('admin.catalog.categories.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/5">
                        {categories.filter(cat => cat && cat._id).map((category) => (
                            <tr key={category._id} className="hover:bg-foreground/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="w-12 h-12 rounded-lg bg-foreground/5 overflow-hidden border border-foreground/10">
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-foreground/20">
                                                <FiImage size={18} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-foreground">{category.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-mono text-foreground/50 bg-foreground/5 px-2 py-1 rounded w-fit">{category.slug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${category.status === 'active'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-foreground/5 text-foreground/40 border-foreground/10'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${category.status === 'active' ? 'bg-green-500' : 'bg-foreground/30'}`}></span>
                                        {category.status === 'active' ? t('admin.catalog.categories.table.active') : t('admin.catalog.categories.table.inactive')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-foreground/40">
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/categories/${category.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
                                            title={t('admin.catalog.categories.table.viewOnSite')}
                                        >
                                            <FiEye size={16} />
                                        </Link>
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
                                            title={t('admin.common.edit')}
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(category._id)}
                                            className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title={t('admin.common.delete')}
                                        >
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
    );
}
