import { COMPONENTS } from '@/config/component-store.config';
import type { Translate } from '@/hooks/useTranslation';
import type { CustomPage, PageSection } from '@/types/page';
import { getInitialSectionsConfig } from '../_config/layout-editor.config';

const PAGE_ID_BY_SLUG: Record<string, string> = {
  home: 'home',
  about: 'about',
  contact: 'contact',
  login: 'login',
  register: 'register',
  'product-detail': 'product',
  'privacy-policy': 'privacy',
  'terms-of-service': 'terms',
  accessibility: 'accessibility',
  categories: 'categories',
  collections: 'categories',
  journal: 'journal',
  'journal-detail': 'journal-detail',
};

const PAGE_SLUG_BY_ID: Record<string, string> = {
  home: 'home',
  about: 'about',
  contact: 'contact',
  login: 'login',
  register: 'register',
  product: 'product-detail',
  privacy: 'privacy-policy',
  terms: 'terms-of-service',
  accessibility: 'accessibility',
  categories: 'categories',
  journal: 'journal',
  'journal-detail': 'journal-detail',
};

export function getUnknownErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const maybeMessage = 'message' in error ? (error as { message?: unknown }).message : undefined;
    if (typeof maybeMessage === 'string') return maybeMessage;
    const maybePayload = 'payload' in error ? (error as { payload?: unknown }).payload : undefined;
    if (typeof maybePayload === 'string') return maybePayload;
    const maybeError = 'error' in error ? (error as { error?: unknown }).error : undefined;
    if (typeof maybeError === 'string') return maybeError;
  }
  return '';
}

export function getPageIdFromSlug(page: CustomPage) {
  return PAGE_ID_BY_SLUG[page.slug] || page._id;
}

export function resolvePageSlugFromId(pageId: string, availablePages: CustomPage[]) {
  return PAGE_SLUG_BY_ID[pageId] || availablePages.find((page) => page._id === pageId)?.slug;
}

export function buildSectionsState(
  pages: CustomPage[],
  t: Translate
): Record<string, PageSection[]> {
  const initial = getInitialSectionsConfig(t);
  const nextSectionsState: Record<string, PageSection[]> = { ...initial };

  pages.forEach((pageRecord) => {
    const pageId = getPageIdFromSlug(pageRecord);

    if (!pageRecord.sections) return;

    nextSectionsState[pageId] = pageRecord.sections.map((section) => {
      const id = typeof section === 'string' ? section : section.id;
      const isActive = typeof section === 'string' ? true : (section.isActive ?? true);
      const baseType = id.includes('_instance_') ? id.split('_instance_')[0] : id;

      const componentDef = COMPONENTS.find((component) => component.id === baseType);
      const initialDef = Object.values(initial).flat().find((item) => item.id === baseType);

      return {
        id,
        label: componentDef ? t(componentDef.titleKey) : (initialDef?.label || id),
        description: componentDef ? t(componentDef.descriptionKey) : (initialDef?.description || 'Section'),
        isActive,
        hasSettings: true,
      };
    });
  });

  return nextSectionsState;
}

export function fetchSettingsForSelectedPage(
  selectedPageId: string,
  actions: {
    fetchProductSettings: (admin?: boolean) => Promise<void>;
    fetchAboutSettings: (admin?: boolean) => Promise<void>;
    fetchContactSettings: (admin?: boolean) => Promise<void>;
    fetchAuthSettings: (admin?: boolean) => Promise<void>;
    fetchLegalSettings: (type: string, forceRefresh?: boolean) => Promise<void>;
  }
) {
  switch (selectedPageId) {
    case 'product':
      return actions.fetchProductSettings(true);
    case 'about':
      return actions.fetchAboutSettings(true);
    case 'contact':
      return actions.fetchContactSettings(true);
    case 'login':
    case 'register':
      return actions.fetchAuthSettings(true);
    case 'privacy':
      return actions.fetchLegalSettings('privacy_policy');
    case 'terms':
      return actions.fetchLegalSettings('terms_of_service');
    case 'accessibility':
      return actions.fetchLegalSettings('accessibility');
    default:
      return Promise.resolve();
  }
}

export function refreshDataForSelectedPage(
  selectedPageId: string,
  actions: {
    fetchInstances: () => Promise<void>;
    fetchHomeSettings: (admin?: boolean) => Promise<void>;
    fetchProductSettings: (admin?: boolean) => Promise<void>;
    fetchAboutSettings: (admin?: boolean) => Promise<void>;
    fetchContactSettings: (admin?: boolean) => Promise<void>;
    fetchAuthSettings: (admin?: boolean) => Promise<void>;
    fetchLegalSettings: (type: string, forceRefresh?: boolean) => Promise<void>;
  }
) {
  void actions.fetchInstances();

  switch (selectedPageId) {
    case 'home':
    case 'categories':
    case 'journal':
    case 'journal-detail':
      return actions.fetchHomeSettings(true);
    case 'product':
      return actions.fetchProductSettings(true);
    case 'about':
      return actions.fetchAboutSettings(true);
    case 'contact':
      return actions.fetchContactSettings(true);
    case 'login':
    case 'register':
      return actions.fetchAuthSettings(true);
    case 'privacy':
      return actions.fetchLegalSettings('privacy_policy', true);
    case 'terms':
      return actions.fetchLegalSettings('terms_of_service', true);
    case 'accessibility':
      return actions.fetchLegalSettings('accessibility', true);
    default:
      return Promise.resolve();
  }
}
