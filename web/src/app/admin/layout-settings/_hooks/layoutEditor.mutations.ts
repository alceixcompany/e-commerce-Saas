import type { Translate } from '@/hooks/useTranslation';
import type { ComponentInstance, ComponentPayload } from '@/types/component';
import type { ContactSettings } from '@/types/content';
import type { CustomPage, PageSection } from '@/types/page';
import { getInitialSectionsConfig } from '../_config/layout-editor.config';
import { getUnknownErrorMessage } from './layoutEditor.helpers';

const SYSTEM_PAGE_LABELS: Record<string, string> = {
  home: 'Home Page',
  about: 'About Us',
  contact: 'Contact',
  login: 'Login',
  register: 'Register',
  'product-detail': 'Product Detail Layout',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  accessibility: 'Accessibility',
  categories: 'Categories Catalog',
  collections: 'Collections Catalog',
};

export async function persistLayoutChange(args: {
  pageId: string;
  updatedSections: PageSection[];
  pages: CustomPage[];
  fetchPages: () => Promise<CustomPage[]>;
  resolvePageSlug: (pageId: string, availablePages?: CustomPage[]) => string | undefined;
  cmsUpdatePage: (id: string, data: Partial<CustomPage>) => Promise<CustomPage>;
  cmsCreatePage: (data: Partial<CustomPage>) => Promise<CustomPage>;
  triggerRefresh: () => void;
  isTransientSaveError: (error: unknown) => boolean;
}) {
  const {
    pageId,
    updatedSections,
    pages,
    fetchPages,
    resolvePageSlug,
    cmsUpdatePage,
    cmsCreatePage,
    triggerRefresh,
    isTransientSaveError,
  } = args;

  try {
    const slug = resolvePageSlug(pageId);
    if (!slug) return;

    let existingPage = pages.find((page) => page.slug === slug);

    if (!existingPage) {
      const latestPages = await fetchPages();
      existingPage = latestPages.find((page) => page.slug === slug);
    }

    if (existingPage) {
      await cmsUpdatePage(existingPage._id, { sections: updatedSections });
    } else {
      try {
        await cmsCreatePage({
          title: SYSTEM_PAGE_LABELS[slug] || slug,
          slug,
          path: slug === 'home' ? '/' : `/${slug}`,
          sections: updatedSections,
        });
      } catch {
        const latestPages = await fetchPages();
        const recoveredPage = latestPages.find((page) => page.slug === slug);

        if (recoveredPage) {
          await cmsUpdatePage(recoveredPage._id, { sections: updatedSections });
        }
      }
    }

    triggerRefresh();
  } catch (error) {
    if (isTransientSaveError(error)) {
      try {
        const latestPages = await fetchPages();
        const slug = resolvePageSlug(pageId, latestPages);

        if (!slug) return;

        const recoveredPage = latestPages.find((page) => page.slug === slug);
        if (recoveredPage) {
          await cmsUpdatePage(recoveredPage._id, { sections: updatedSections });
          triggerRefresh();
          return;
        }
      } catch (retryError) {
        console.error(`Retry failed while persisting layout for ${pageId}:`, retryError);
      }
    }

    throw error;
  }
}

export function buildSectionsAfterAdd(args: {
  sectionId: string;
  selectedPageId: string;
  sectionsState: Record<string, PageSection[]>;
  pages: CustomPage[];
  t: Translate;
}) {
  const { sectionId, selectedPageId, sectionsState, t } = args;
  const currentSections = sectionsState[selectedPageId] || [];
  const sectionExists = currentSections.some((section) => section.id === sectionId);

  if (sectionExists) {
    return currentSections.map((section) =>
      section.id === sectionId ? { ...section, isActive: true } : section
    );
  }

  const baseType = sectionId.includes('_instance_') ? sectionId.split('_instance_')[0] : sectionId;
  const allInitial = Object.values(getInitialSectionsConfig(t)).flat();
  const definition = allInitial.find((section) => section.id === baseType);

  if (definition) {
    return [...currentSections, { ...definition, id: sectionId, isActive: true }];
  }

  return [
    ...currentSections,
    {
      id: sectionId,
      label: sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('_', ' '),
      description: 'New Component',
      isActive: true,
      hasSettings: true,
    },
  ];
}

function getConversionTargetSectionId(sectionId: string) {
  if (sectionId === 'contact_split_form') return 'contact_form';
  if (sectionId === 'contact_faq') return 'contact_info';
  return sectionId;
}

function getContactInitialData(selectedPageId: string, contactSettings: ContactSettings | null, sectionId: string) {
  if (selectedPageId !== 'contact' || !contactSettings) return {};
  if (sectionId === 'contact_hero' || sectionId === 'page_hero') return contactSettings.hero || {};
  if (sectionId === 'contact_form') return contactSettings.splitForm || {};
  if (sectionId === 'contact_info') return contactSettings.faq || {};
  return {};
}

export async function executeSectionConversion(args: {
  sectionId: string;
  name: string;
  selectedPageId: string;
  contactSettings: ContactSettings | null;
  createInstance: (payload: ComponentPayload) => Promise<ComponentInstance>;
  updateContactSettings: (settings: ContactSettings) => Promise<void>;
  triggerRefresh: () => void;
  setActiveInstanceId: (instanceId: string | null) => void;
  setActiveModal: (modalId: string | null) => void;
}) {
  const {
    sectionId,
    name,
    selectedPageId,
    contactSettings,
    createInstance,
    updateContactSettings,
    triggerRefresh,
    setActiveInstanceId,
    setActiveModal,
  } = args;

  const finalSectionId = getConversionTargetSectionId(sectionId);
  const initialData = getContactInitialData(selectedPageId, contactSettings, finalSectionId);

  const result = await createInstance({
    type: finalSectionId,
    name: name.trim(),
    data: initialData,
  });

  const newInstanceId = result._id;
  const fullNewId = `${finalSectionId}_instance_${newInstanceId}`;

  if (selectedPageId === 'contact' && contactSettings?.sectionOrder) {
    const newOrder = contactSettings.sectionOrder.map((id) => (id === sectionId ? fullNewId : id));
    await updateContactSettings({ ...contactSettings, sectionOrder: newOrder });
  }

  setActiveInstanceId(newInstanceId);
  setActiveModal(finalSectionId);
  triggerRefresh();
  return result;
}

export function formatPersistLayoutError(error: unknown) {
  return `Sayfa kaydedilirken hata oluştu: ${getUnknownErrorMessage(error) || 'Bilinmeyen hata'}`;
}
