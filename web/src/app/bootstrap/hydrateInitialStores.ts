import { 
  BootstrapConfig, 
  GlobalSettings, 
  HomeSettings, 
  ProductSettings, 
  AboutSettings, 
  ContactSettings, 
  AuthSettings,
  Banner,
  PopularCollectionsContent
} from '@/types/content';
import { CustomPage } from '@/types/page';
import { ComponentInstance } from '@/types/component';

interface HydrateInitialStoresArgs {
  initialData?: BootstrapConfig & {
    pageData?: CustomPage;
    components?: ComponentInstance[];
  };
  setGlobalSettings: (settings: GlobalSettings | null) => void;
  hydratePage: (page: CustomPage) => void;
  setInstances: (instances: ComponentInstance[]) => void;
  setHomeSettings: (settings: HomeSettings | null) => void;
  setProductSettings: (settings: ProductSettings | null) => void;
  setAboutSettings: (settings: AboutSettings | null) => void;
  setContactSettings: (settings: ContactSettings | null) => void;
  setAuthSettings: (settings: AuthSettings | null) => void;
  setBanners: (banners: Banner[]) => void;
  setPopularCollections: (content: PopularCollectionsContent | null) => void;
}

export function hydrateInitialStores({
  initialData,
  setGlobalSettings,
  hydratePage,
  setInstances,
  setHomeSettings,
  setProductSettings,
  setAboutSettings,
  setContactSettings,
  setAuthSettings,
  setBanners,
  setPopularCollections,
}: HydrateInitialStoresArgs) {
  if (!initialData) return;

  if (initialData.pageData) {
    hydratePage(initialData.pageData);
  }

  if (initialData.global_settings) {
    setGlobalSettings(initialData.global_settings);
  }

  if (initialData.home_settings) {
    setHomeSettings(initialData.home_settings);
  }

  if (initialData.product_settings) {
    setProductSettings(initialData.product_settings);
  }

  if (initialData.about_settings) {
    setAboutSettings(initialData.about_settings);
  }

  if (initialData.contact_settings) {
    setContactSettings(initialData.contact_settings);
  }

  if (initialData.auth_settings) {
    setAuthSettings(initialData.auth_settings);
  }

  if (initialData.banners) {
    setBanners(initialData.banners);
  }

  if (initialData.popular_collections) {
    setPopularCollections(initialData.popular_collections);
  }

  if (initialData.components) {
    setInstances(initialData.components);
  }
}
