'use client';

import { useProductForm } from '../_hooks/useProductForm';
import ProductForm from '../_components/ProductForm';
import { useTranslation } from '@/hooks/useTranslation';

export default function NewProductPage() {
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
    } = useProductForm();

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
