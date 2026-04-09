'use client';

import { useProductForm } from '../_hooks/useProductForm';
import ProductForm from '../_components/ProductForm';

export default function NewProductPage() {
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
            title="Add New Product"
            subtitle="Create a new product listing for your store."
            formData={formData}
            handleChange={handleChange}
            setManualField={setManualField}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            categories={categories}
            onCancel={() => router.back()}
            submitLabel="Save Product"
            formId="product-form"
        />
    );
}
