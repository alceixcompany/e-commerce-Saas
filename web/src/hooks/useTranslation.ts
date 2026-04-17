'use client';

import { useCallback } from 'react';
import { useContentStore } from '@/lib/store/useContentStore';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';

const translations = {
  en,
  tr,
};

export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type Translate = (path: NestedKeyOf<typeof en>, variables?: Record<string, string | number>) => string;

export function useTranslation() {
  const { globalSettings } = useContentStore();
  const locale = (globalSettings?.activeLanguage as 'en' | 'tr') || 'tr';
  
  const t = useCallback((path: NestedKeyOf<typeof en>, variables?: Record<string, string | number>) => {
    const keys = path.split('.');
    let current: unknown = translations[locale];
    
    let found = true;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[key];
      } else {
        found = false;
        break;
      }
    }

    if (!found) {
        // Fallback to Turkish
        current = translations['tr'];
        for (const key of keys) {
            if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
                current = (current as Record<string, unknown>)[key];
            } else {
                return path;
            }
        }
    }
    
    if (typeof current === 'string' && variables) {
      return Object.entries(variables).reduce((acc, [key, value]) => {
        return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }, current);
    }

    return typeof current === 'string' ? current : path;
  }, [locale]);

  return { t, locale, i18n: { language: locale } };
}
