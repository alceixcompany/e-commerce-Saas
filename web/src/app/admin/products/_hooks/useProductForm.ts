import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { 
    createProduct, 
    updateProduct, 
    fetchProductAdmin, 
    clearError, 
    clearCurrentProduct 
} from '@/lib/slices/productSlice';
import { fetchCategories } from '@/lib/slices/categorySlice';
import { ProductFormData } from '@/types/product';

export function useProductForm(productId?: string) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const { currentProduct, loading, error } = useAppSelector((state) => state.product);
    const { categories } = useAppSelector((state) => state.category);
    
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
    const isInitialLoading = Boolean(productId && loading.fetchOne && !currentProduct);

    // Initialization
    useEffect(() => {
        dispatch(fetchCategories());
        
        if (productId) {
            dispatch(fetchProductAdmin(productId));
        }

        return () => {
            if (productId) {
                dispatch(clearCurrentProduct());
            }
        };
    }, [dispatch, productId]);

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

        dispatch(clearError());

        const productData = {
            name: formData.name.trim(),
            category: formData.category,
            shortDescription: formData.shortDescription?.trim() || undefined,
            price: parseFloat(formData.price),
            discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
            stock: parseInt(formData.stock),
            sku: formData.sku.trim(),
            mainImage: formData.mainImage,
            images: formData.images || [],
            shippingWeight: parseFloat(formData.shippingWeight),
            status: formData.status as 'active' | 'inactive',
            rating: formData.rating ? parseFloat(formData.rating) : undefined,
            isNewArrival: formData.isNewArrival,
            isBestSeller: formData.isBestSeller,
        };

        try {
            if (productId) {
                await dispatch(updateProduct({ id: productId, data: productData })).unwrap();
            } else {
                await dispatch(createProduct(productData)).unwrap();
            }
            router.push('/admin/products');
        } catch (err) {
            console.error('Submission error:', err);
        }
    };

    return {
        formData,
        setFormData,
        handleChange,
        setManualField,
        handleSubmit,
        isLoading: productId ? loading.fetchOne || loading.update : loading.create,
        isInitialLoading,
        error,
        categories,
        router
    };
}
