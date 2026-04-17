'use client';

import { useProductForm } from '../../_hooks/useProductForm';
import ProductForm from '../../_components/ProductForm';

interface EditProductClientProps {
    productId: string;
    initialData: {
        product: any;
        categories: any[];
    };
}

export default function EditProductClient({ productId, initialData }: EditProductClientProps) {
    const {
        formData,
        handleChange,
        setManualField,
        handleSubmit,
        isLoading,
        error,
        categories,
        router
    } = useProductForm(productId, initialData);

    return (
        <ProductForm
            title="Edit Product"
            subtitle="Update product information and settings."
            formData={formData}
            handleChange={handleChange}
            setManualField={setManualField}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            categories={categories}
            onCancel={() => router.back()}
            submitLabel="Save Changes"
            formId="edit-product-form"
        />
    );
}
