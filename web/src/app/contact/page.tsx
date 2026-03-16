'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchContactSettings } from '@/lib/slices/contentSlice';

import ContactHero from './_components/ContactHero';
import ContactSplitForm from './_components/ContactSplitForm';
import ContactFaq from './_components/ContactFaq';

export default function ContactPage() {
    const dispatch = useAppDispatch();
    const { contactSettings, isLoading } = useAppSelector((state) => state.content);

    useEffect(() => {
        dispatch(fetchContactSettings());
    }, [dispatch]);

    if (isLoading || !contactSettings) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-foreground/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const { hero, splitForm, faq, sectionOrder, hiddenSections } = contactSettings;

    const renderSection = (sectionId: string) => {
        if (hiddenSections?.includes(sectionId)) return null;

        switch (sectionId) {
            case 'contact_hero':
                if (!hero?.isVisible) return null;
                return <ContactHero key={sectionId} data={hero as any} />;
            case 'contact_split_form':
                if (!splitForm?.isVisible) return null;
                return <ContactSplitForm key={sectionId} data={splitForm as any} />;
            case 'contact_faq':
                if (!faq?.isVisible) return null;
                return <ContactFaq key={sectionId} data={faq as any} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-background min-h-screen font-sans selection:bg-primary/30">
            {sectionOrder?.map(sectionId => renderSection(sectionId))}
        </div>
    );
}
