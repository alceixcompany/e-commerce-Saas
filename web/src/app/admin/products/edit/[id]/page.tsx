'use client';

import { useParams } from 'next/navigation';
import { useProductForm } from '../../_hooks/useProductForm';
import ProductForm from '../../_components/ProductForm';

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id as string;
    
    const {
        formData,
        handleChange,
        setManualField,
        handleSubmit,
        isLoading,
        isInitialLoading,
        error,
        categories,
        router
    } = useProductForm(productId);

    if (isInitialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                    <p className="text-gray-500 font-medium">Loading product details...</p>
                </div>
            </div>
        );
    }

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
