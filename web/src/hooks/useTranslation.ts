'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/lib/hooks';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';

const translations = {
  en,
  tr,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export function useTranslation() {
  const { globalSettings } = useAppSelector((state) => state.content);
  const locale = (globalSettings?.activeLanguage as 'en' | 'tr') || 'tr';
  
  const t = useCallback((path: NestedKeyOf<typeof en>, variables?: Record<string, any>) => {
    const keys = path.split('.');
    let current: any = translations[locale];
    
    let found = true;
    for (const key of keys) {
      if (current[key] === undefined) {
        found = false;
        break;
      }
      current = current[key];
    }

    if (!found) {
        // Fallback to Turkish
        current = translations['tr'];
        for (const key of keys) {
            if (current[key] === undefined) return path;
            current = current[key];
        }
    }
    
    if (typeof current === 'string' && variables) {
      return Object.entries(variables).reduce((acc, [key, value]) => {
        return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }, current);
    }

    return current;
  }, [locale]);

  return { t, locale };
}
