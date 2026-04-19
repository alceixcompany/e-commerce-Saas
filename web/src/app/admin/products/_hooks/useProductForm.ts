import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useProductStore } from '@/lib/store/useProductStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { ProductFormData } from '@/types/product';
import { getErrorMessage } from '@/lib/utils/error';

export function useProductForm(productId?: string, initialData?: { product?: any; categories?: any[] }) {
    const router = useRouter();
    const { 
        currentProduct: storeProduct, 
        isLoading: productLoading, 
        error,
        warning,
        fetchProductById,
        createProduct,
        updateProduct,
        setCurrentProduct,
        clearError 
    } = useProductStore();
    
    const { 
        categories: storeCategories, 
        fetchCategories 
    } = useCategoryStore();
    
    // Prioritize initial data from props, then store
    const currentProduct = initialData?.product || storeProduct;
    const categories = initialData?.categories || storeCategories;
    
    const emptyFormData = useMemo<ProductFormData>(() => ({
        name: '',
        category: '',
        shortDescription: '',
        price: '',
        discountedPrice: '',
        stock: '',
        sku: '',
        mainImage: '',
        images: [],
        shippingWeight: '',
        status: 'active',
        rating: '',
        isNewArrival: false,
        isBestSeller: false,
    }), []);

    const baseFormData = useMemo<ProductFormData>(() => {
        if (!productId || !currentProduct) return emptyFormData;

        const ratingValue =
            typeof currentProduct === 'object' &&
            currentProduct !== null &&
            'rating' in currentProduct
                ? (currentProduct as { rating?: unknown }).rating
                : undefined;

        return {
            name: currentProduct.name || '',
            category: typeof currentProduct.category === 'object' ? currentProduct.category._id : currentProduct.category || '',
            shortDescription: currentProduct.shortDescription || '',
            price: currentProduct.price?.toString() || '',
            discountedPrice: currentProduct.discountedPrice?.toString() || '',
            stock: currentProduct.stock?.toString() || '',
            sku: currentProduct.sku || '',
            mainImage: currentProduct.mainImage || currentProduct.image || '',
            images: currentProduct.images || [],
            shippingWeight: currentProduct.shippingWeight?.toString() || '',
            status: currentProduct.status || 'active',
            rating: typeof ratingValue === 'number' ? ratingValue.toString() : '',
            isNewArrival: currentProduct.isNewArrival ?? false,
            isBestSeller: currentProduct.isBestSeller ?? false,
        };
    }, [currentProduct, emptyFormData, productId]);

    const [overrides, setOverrides] = useState<Partial<ProductFormData>>({});
    const formData = useMemo<ProductFormData>(() => ({ ...baseFormData, ...overrides }), [baseFormData, overrides]);
    const isInitialLoading = Boolean(productId && productLoading.single && !currentProduct);

    // Initialization - skip fetch if initial data is provided
    useEffect(() => {
        if (!initialData?.categories) {
            fetchCategories();
        }
        
        if (productId && !initialData?.product) {
            fetchProductById(productId);
        }

        return () => {
            if (productId) {
                setCurrentProduct(null);
            }
        };
    }, [fetchCategories, fetchProductById, setCurrentProduct, productId, initialData]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setOverrides((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    }, []);

    const setFormData = useCallback((next: React.SetStateAction<ProductFormData>) => {
        setOverrides(() => (typeof next === 'function' ? next(formData) : next));
    }, [formData]);

    const setManualField = useCallback(<K extends keyof ProductFormData>(name: K, value: ProductFormData[K]) => {
        setOverrides((prev) => ({ ...prev, [name]: value }));
    }, []);

    const validateForm = () => {
        const requiredFields: (keyof ProductFormData)[] = ['name', 'category', 'price', 'stock', 'sku', 'mainImage', 'shippingWeight'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        clearError();

        const productData = {
            name: formData.name.trim(),
            category: formData.category,
            shortDescription: formData.shortDescription?.trim() || undefined,
            price: parseFloat(formData.price) || 0,
            discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
            stock: parseInt(formData.stock) || 0,
            sku: formData.sku.trim(),
            mainImage: formData.mainImage,
            images: formData.images || [],
            shippingWeight: parseFloat(formData.shippingWeight) || 0,
            status: formData.status as 'active' | 'inactive',
            rating: (formData.rating && !isNaN(parseFloat(formData.rating))) ? parseFloat(formData.rating) : undefined,
            isNewArrival: formData.isNewArrival,
            isBestSeller: formData.isBestSeller,
        };

        try {
            if (productId) {
                await updateProduct(productId, productData);
            } else {
                await createProduct(productData);
            }
            router.push('/admin/products');
        } catch (err: any) {
            console.error('Submission error:', err);
            if (err.warning) {
                toast.warning(getErrorMessage(err), {
                    description: 'Please use a unique SKU and try again.',
                    duration: 5000,
                });
            }
        }
    };

    return {
        formData,
        setFormData,
        handleChange,
        setManualField,
        handleSubmit,
        isLoading: productId ? productLoading.single || productLoading.action : productLoading.action,
        isInitialLoading,
        error,
        warning,
        categories,
        router
    };
}
