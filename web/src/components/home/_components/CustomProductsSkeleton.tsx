'use client';

import React from 'react';

interface CustomProductsSkeletonProps {
    variant?: 'grid' | 'slider' | 'focused';
}

export default function CustomProductsSkeleton({ variant = 'grid' }: CustomProductsSkeletonProps) {
    const renderCardSkeleton = (idx: number) => (
        <div key={idx} className="space-y-4">
            <div className="aspect-[3/4] bg-muted/20 animate-pulse rounded-2xl" />
            <div className="space-y-2">
                <div className="h-2 w-1/3 bg-muted/20 animate-pulse rounded mx-auto" />
                <div className="h-4 w-2/3 bg-muted/20 animate-pulse rounded mx-auto" />
                <div className="h-3 w-1/4 bg-muted/20 animate-pulse rounded mx-auto" />
            </div>
        </div>
    );

    const renderGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {[...Array(8)].map((_, idx) => renderCardSkeleton(idx))}
        </div>
    );

    const renderSlider = () => (
        <div className="flex gap-8 overflow-hidden pb-12">
            {[...Array(5)].map((_, idx) => (
                <div key={idx} className="min-w-[280px] md:min-w-[350px]">
                    {renderCardSkeleton(idx)}
                </div>
            ))}
        </div>
    );

    const renderFocused = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-6">
                <div className="aspect-[3/4] bg-muted/20 animate-pulse rounded-2xl h-full" />
            </div>
            <div className="lg:col-span-6 grid grid-cols-2 gap-4 md:gap-6">
                {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-fit">
                        <div className="aspect-[3/4] bg-muted/20 animate-pulse rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <section className="w-full bg-background py-20 md:py-32 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-20 text-center mb-16 space-y-4">
                <div className="h-3 w-32 bg-muted/20 animate-pulse rounded mx-auto" />
                <div className="h-10 w-64 bg-muted/20 animate-pulse rounded mx-auto" />
            </div>

            <div className={`mx-auto px-6 lg:px-20 ${variant === 'focused' ? 'max-w-[1300px]' : 'max-w-[1440px]'}`}>
                {variant === 'grid' && renderGrid()}
                {variant === 'slider' && renderSlider()}
                {variant === 'focused' && renderFocused()}
            </div>
        </section>
    );
}
