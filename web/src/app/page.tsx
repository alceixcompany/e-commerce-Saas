import { serverContentService } from '@/lib/server/services/contentService';
import HomeClientWrapper from './HomeClientWrapper';
import { CustomPage } from '@/types/page';

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isPreview = resolvedSearchParams?.preview === 'true';
  // Sunucu üzerinde Home sayfası verisi çekiliyor (RSC Cache)
  let pageData = await serverContentService.getPageBySlug('home', isPreview);
  
  // Eğer API'ye erişim anlık yoksa default fallback section order.
  if (!pageData) {
      pageData = {
          slug: 'home',
          title: 'Home',
          sections: ['hero', 'collections', 'featured', 'banner', 'popular', 'journal', 'advantages']
      } as CustomPage;
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <main className="pt-0">
        <HomeClientWrapper currentPage={pageData} />
      </main>
    </div>
  );
}
