'use client';

import React, { useEffect, lazy, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchLegalSettings } from "@/lib/slices/contentSlice";
import { fetchComponentInstances } from "@/lib/slices/componentSlice";

// Dynamic components
const PageHero = lazy(() => import('@/components/home/PageHero'));
const FAQSection = lazy(() => import('@/components/home/FAQSection'));
const ExploreByRoomSection = lazy(() => import('@/components/home/ExploreByRoomSection'));
const AboutUsSection = lazy(() => import('@/components/home/AboutUsSection'));
const CustomProductsSection = lazy(() => import('@/components/home/CustomProductsSection'));
const LegalContentSection = lazy(() => import('@/components/home/LegalContentSection'));

export default function AccessibilityPage() {
    const dispatch = useAppDispatch();
    const { accessibilitySettings, globalSettings, loading: contentLoading } = useAppSelector((state) => state.content);
    const isLoading = contentLoading.legalSettings;
    const { instances } = useAppSelector((state) => state.component);

    useEffect(() => {
        dispatch(fetchLegalSettings({ type: 'accessibility' }));
        dispatch(fetchComponentInstances(undefined));
    }, [dispatch]);

    if (isLoading || !accessibilitySettings) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-foreground/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const theme = globalSettings.theme || {};
    const bgColor = theme.backgroundColor || '#ffffff';
    const secondaryColor = theme.secondaryColor || '#000000';

    // Simple luminance check to determine if background is dark
    const isDarkBackground = (color: string) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 128;
    };

    const isDark = isDarkBackground(bgColor);
    const headingColor = (isDark && (secondaryColor === '#000000' || secondaryColor === '#18181b')) 
        ? '#ffffff' 
        : secondaryColor;

    const { sectionOrder, hiddenSections } = accessibilitySettings;

    const renderSection = (sectionId: string) => {
        if (hiddenSections?.includes(sectionId)) return null;

        const isInstance = sectionId.includes('_instance_');
        const type = isInstance ? sectionId.split('_instance_')[0] : sectionId;
        const instanceId = isInstance ? sectionId.split('_instance_')[1] : undefined;
        
        const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
        const data = instance?.data;

        switch (type) {
            case 'accessibility_edit':
            case 'legal_content':
                return (
                    <LegalContentSection 
                        key={sectionId} 
                        instanceId={instanceId}
                        data={!isInstance ? {
                            title: accessibilitySettings.title,
                            content: accessibilitySettings.content,
                            lastUpdated: accessibilitySettings.lastUpdated,
                            variant: 'standard'
                        } : undefined}
                    />
                );
            case 'page_hero':
            case 'contact_hero':
                return <PageHero key={sectionId} data={data} instanceId={instanceId} />;
            case 'faq':
                return <FAQSection key={sectionId} instanceId={instanceId} />;
            case 'explore_rooms':
                return <ExploreByRoomSection key={sectionId} instanceId={instanceId} />;
            case 'about_us':
                return <AboutUsSection key={sectionId} instanceId={instanceId} />;
            case 'custom_products':
                return <CustomProductsSection key={sectionId} instanceId={instanceId} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-foreground/10 border-t-primary rounded-full animate-spin"></div></div>}>
                {sectionOrder?.map(id => renderSection(id))}
            </Suspense>
        </div>
    );
}
