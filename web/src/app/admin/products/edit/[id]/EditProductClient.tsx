'use client';

import { useProductForm } from '../../_hooks/useProductForm';
import ProductForm from '../../_components/ProductForm';
import { Category } from '@/types/category';
import { Product } from '@/types/product';

interface EditProductClientProps {
    productId: string;
    initialData: {
        product: Product;
        categories: Category[];
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
        warning,
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
            warning={warning}
            categories={categories}
            onCancel={() => router.back()}
            submitLabel="Save Changes"
            formId="edit-product-form"
        />
    );
}
