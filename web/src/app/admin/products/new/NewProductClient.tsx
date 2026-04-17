'use client';

import { useProductForm } from '../_hooks/useProductForm';
import ProductForm from '../_components/ProductForm';
import { useTranslation } from '@/hooks/useTranslation';

interface NewProductClientProps {
    initialCategories: any[];
}

export default function NewProductClient({ initialCategories }: NewProductClientProps) {
    const { t } = useTranslation();
    const {
        formData,
        handleChange,
        setManualField,
        handleSubmit,
        isLoading,
        error,
        categories,
        router
    } = useProductForm(undefined, { categories: initialCategories });

    return (
        <ProductForm
            title={t('admin.catalog.products.form.addTitle')}
            subtitle={t('admin.catalog.products.form.addSubtitle')}
            formData={formData}
            handleChange={handleChange}
            setManualField={setManualField}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            categories={categories}
            onCancel={() => router.back()}
            submitLabel={t('admin.catalog.products.form.save')}
            formId="product-form"
        />
    );
}
