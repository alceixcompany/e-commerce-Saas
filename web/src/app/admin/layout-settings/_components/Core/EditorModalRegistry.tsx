import { AnimatePresence } from 'framer-motion';
// -- Modals --
import BannerEditorModal from '../Home/BannerEditorModal';
import HeroEditorModal from '../Common/HeroEditorModal';
import FeaturedSectionEditorModal from '../Home/FeaturedSectionEditorModal';
import CategoryLayoutEditorModal from '../Home/CategoryLayoutEditorModal';
import CategoryListingEditorModal from '../Home/CategoryListingEditorModal';
import CollectionsEditorModal from '../Home/CollectionsEditorModal';
import JournalEditorModal from '../Home/JournalEditorModal';
import AdvantageSectionEditorModal from '../Home/AdvantageSectionEditorModal';
import PromoBannerSettingsModal from '../Home/PromoBannerSettingsModal';
import CampaignEditorModal from '../Home/CampaignEditorModal';
import GlobalSettingsEditorModal from '../Global/GlobalSettingsEditorModal';
import ProductSettingsEditorModal from '../Product/ProductSettingsEditorModal';
import AboutHeroEditorModal from '../About/AboutHeroEditorModal';
import AboutAuthenticityEditorModal from '../About/AboutAuthenticityEditorModal';
import AboutShowcaseEditorModal from '../About/AboutShowcaseEditorModal';
import AboutPhilosophyEditorModal from '../About/AboutPhilosophyEditorModal';
import ContactFormEditorModal from '../Contact/ContactFormEditorModal';
import ContactInfoEditorModal from '../Contact/ContactInfoEditorModal';
import AuthLayoutEditorModal from '../Auth/AuthLayoutEditorModal';
import ComponentStoreModal from '../Global/ComponentStoreModal';
import LegalSettingsEditorModal from '../Global/LegalSettingsEditorModal';
import FAQEditorModal from '../Home/FAQEditorModal';
import ExploreRoomsEditorModal from '../Home/ExploreRoomsEditorModal';
import AboutUsEditorModal from '../Home/AboutUsEditorModal';
import CustomProductsEditorModal from '../Home/CustomProductsEditorModal';
import LegalContentEditorModal from '../Home/LegalContentEditorModal';
import BlogListEditorModal from '../Common/BlogListEditorModal';
import BlogDetailEditorModal from '../Common/BlogDetailEditorModal';

interface EditorModalRegistryProps {
    activeModal: string | null;
    activeInstanceId: string | null;
    setActiveModal: (modal: string | null) => void;
    triggerRefresh: () => void;
    isComponentStoreOpen: boolean;
    setIsComponentStoreOpen: (open: boolean) => void;
    handleAddFromStore: (sectionId: string) => void;
    activeSections: string[];
    selectedPageId: string;
}

export default function EditorModalRegistry({
    activeModal,
    activeInstanceId,
    setActiveModal,
    triggerRefresh,
    isComponentStoreOpen,
    setIsComponentStoreOpen,
    handleAddFromStore,
    activeSections,
    selectedPageId
}: EditorModalRegistryProps) {
    const handleClose = () => setActiveModal(null);
    const handleSave = () => {
        triggerRefresh();
        setActiveModal(null);
    };

    return (
        <AnimatePresence>
            {activeModal === 'hero' && (
                <BannerEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'page_hero' && (
                <HeroEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'featured_story' && (
                <FeaturedSectionEditorModal
                    onClose={handleClose}
                    onSave={handleSave}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'collections' && (
                <CategoryLayoutEditorModal
                    onClose={handleClose}
                    onSave={handleSave}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'category_listing' && (
                <CategoryListingEditorModal
                    onClose={handleClose}
                    onSave={handleSave}
                    instanceId={activeInstanceId as string}
                />
            )}
            {activeModal === 'popular' && (
                <CollectionsEditorModal
                    onClose={handleClose}
                    onSave={handleSave}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'journal' && (
                <JournalEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'advantages' && (
                <AdvantageSectionEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'banner' && (
                <PromoBannerSettingsModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'campaigns' && (
                <CampaignEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {['identity', 'theme', 'footer_contact', 'seo', 'navbar'].includes(activeModal || '') && (
                <GlobalSettingsEditorModal
                    sectionId={activeModal!}
                    onClose={handleClose}
                    onSave={handleSave}
                />
            )}
            {['product_details', 'related_products'].includes(activeModal || '') && (
                <ProductSettingsEditorModal
                    sectionId={activeModal!}
                    onClose={handleClose}
                    onSave={handleSave}
                />
            )}
            {activeModal === 'about_hero' && (
                <AboutHeroEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {activeModal === 'about_authenticity' && (
                <AboutAuthenticityEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {activeModal === 'about_showcase' && (
                <AboutShowcaseEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {activeModal === 'about_philosophy' && (
                <AboutPhilosophyEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {activeModal === 'contact_form' && (
                <ContactFormEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'contact_info' && (
                <ContactInfoEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'auth_login' && (
                <AuthLayoutEditorModal
                    type="login"
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {activeModal === 'auth_register' && (
                <AuthLayoutEditorModal
                    type="register"
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {isComponentStoreOpen && (
                <ComponentStoreModal
                    onClose={() => setIsComponentStoreOpen(false)}
                    onAdd={handleAddFromStore}
                    activeIds={activeSections}
                    pageType={selectedPageId}
                />
            )}
            {activeModal === 'privacy_policy_edit' && (
                <LegalSettingsEditorModal
                    type="privacy_policy"
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {activeModal === 'terms_of_service_edit' && (
                <LegalSettingsEditorModal
                    type="terms_of_service"
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {activeModal === 'accessibility_edit' && (
                <LegalSettingsEditorModal
                    type="accessibility"
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                />
            )}
            {activeModal === 'faq_edit' && (
                <FAQEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'explore_rooms_edit' && (
                <ExploreRoomsEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'about_us_edit' && (
                <AboutUsEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'custom_products_edit' && (
                <CustomProductsEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'legal_content' && (
                <LegalContentEditorModal
                    onClose={handleClose}
                    onUpdate={triggerRefresh}
                    instanceId={activeInstanceId || undefined}
                />
            )}
            {activeModal === 'blog_list_edit' && (
                <BlogListEditorModal
                    onClose={handleClose}
                    onSave={handleSave}
                    instanceId={activeInstanceId as string}
                />
            )}
            {activeModal === 'blog_detail_edit' && (
                <BlogDetailEditorModal
                    onClose={handleClose}
                    onSave={handleSave}
                    instanceId={activeInstanceId as string}
                />
            )}
        </AnimatePresence>
    );
}
