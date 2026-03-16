'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchLegalSettings } from "@/lib/slices/contentSlice";

export default function TermsOfServicePage() {
    const dispatch = useAppDispatch();
    const { termsSettings, globalSettings } = useAppSelector((state) => state.content);

    useEffect(() => {
        dispatch(fetchLegalSettings('terms_of_service'));
    }, [dispatch]);

    const theme = globalSettings.theme || {};
    const bgColor = theme.backgroundColor || '#ffffff';
    const textColor = theme.textColor || '#18181b';
    const secondaryColor = theme.secondaryColor || '#000000';
    const primaryColor = theme.primaryColor || '#C5A059';

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
    
    // If branding secondary color is too similar to background, Use text color for headings
    const headingColor = (isDark && (secondaryColor === '#000000' || secondaryColor === '#18181b')) 
        ? '#ffffff' 
        : secondaryColor;

    return (
        <div 
            className="pt-32 pb-24 font-sans transition-colors duration-500"
            style={{ 
                backgroundColor: bgColor,
                color: textColor,
                fontFamily: theme.bodyFont || 'Inter, sans-serif'
            }}
        >
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <h1 
                    className="text-4xl md:text-6xl font-bold mb-12 text-center tracking-tight"
                    style={{ 
                        fontFamily: theme.headingFont || 'Playfair Display, serif',
                        color: headingColor
                    }}
                >
                    {termsSettings.title}
                </h1>

                {termsSettings.lastUpdated && (
                    <p className="text-center text-sm opacity-50 mb-16 italic">
                        Last Updated: {new Date(termsSettings.lastUpdated).toLocaleDateString()}
                    </p>
                )}

                <div 
                    className={`prose prose-lg max-w-none prose-headings:font-bold ${isDark ? 'prose-invert' : 'prose-stone'}`}
                    style={{ 
                        '--tw-prose-headings': headingColor,
                        '--tw-prose-body': textColor,
                        '--tw-prose-bold': textColor,
                        '--tw-prose-links': primaryColor,
                        '--tw-prose-bullets': primaryColor,
                        '--tw-prose-counters': primaryColor,
                        fontFamily: theme.bodyFont || 'Inter, sans-serif'
                    } as any}
                >
                    <div 
                        className="prose-direct-content"
                        style={{ 
                            '--heading-font': theme.headingFont || 'Playfair Display, serif'
                        } as any}
                        dangerouslySetInnerHTML={{ __html: termsSettings.content }} 
                    />
                </div>
            </div>

            <style jsx global>{`
                .prose-direct-content h1, 
                .prose-direct-content h2, 
                .prose-direct-content h3, 
                .prose-direct-content h4 {
                    font-family: var(--heading-font);
                    color: var(--tw-prose-headings);
                }
            `}</style>
        </div>
    );
}
