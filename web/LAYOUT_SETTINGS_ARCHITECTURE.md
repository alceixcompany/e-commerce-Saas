# Layout Settings Architecture & Data Flow

Bu doküman, e-ticaret panelindeki "Layout Settings" (Görünüm Ayarları) mimarisinin nasıl çalıştığını, verilerin nasıl aktığını ve yeni bir bölüm ekleneceği zaman hangi adımların izlenmesi gerektiğini açıklar. Sistem, performans ve yönetilebilirlik için **Modüler** bir yapıya (Modular Settings Architecture) geçirilmiştir.

---

## 1. Temel Mantık (Neden Modüler Yapı?)

Önceden sistemdeki tüm ayarlar (logo, hero video, site title vs.) tek bir devasa `global_settings` objesi içinde tutuluyordu. Bu durum:
- Performans kaybına (anasayfa yüklenirken footer ayarlarının da gereksiz yere çekilmesi),
- Kod karmaşasına,
- Veri çakışmalarına (bir yeri güncellerken diğer teferruatların ezilmesi) neden oluyordu.

**Yeni Mimari:** Her sayfa veya mantıksal bölüm kendi ayar datasını bağımsız tutar.
- **`global_settings`**: Tüm sitede geçerli olanlar (Logo, Footer, SEO Tagleri).
- **`home_settings`**: Sadece anasayfada geçerli olanlar (Hero Slider, Featured Section, Bannerlar).
- **`popular_collections`**: Sadece popüler kategoriler alanına ait data.

Mongoose veritabanında tüm bu farklı parçalar tek bir `SectionContent` modelinde tutulur. Ayrım sadece `identifier` alanı (örn: `global_settings`, `home_settings`) ile yapılır.

---

## 2. Dosya Hiyerarşisi (Frontend / Admin)

Admin layout ayarları arayüzü tek bir sayfa ve bir sürü alt modal'dan oluşur:

```text
web/src/app/admin/layout-settings/
│
├── page.tsx                     # ANA ORKESTRA (Sidebar sayfalar, Ortada İframe Önizleme)
│
└── _components/                 # MODALLAR (Açılacak detaylı düzenleme pencereleri)
    ├── Global/
    │   └── GlobalSettingsEditorModal.tsx  (Navbar, Footer, SEO düzenler)
    │
    └── Home/
        ├── BannerEditorModal.tsx          (Hero Video ve Slider düzenler)
        ├── FeaturedSectionEditorModal.tsx (Ortadaki hikaye/resim+metin kısmını)
        └── CollectionsEditorModal.tsx     (New Arrivals vs düzenler)
```

**Önemli Not:** `_components` klasörünün başındaki alt tire `_`, Next.js App Router yapısında buranın bir URL rotası (page) **olmadığını**, sadece yardımcı bileşenler içerdiğini sisteme belirtir.

---

## 3. Redux Bağlantıları ve Veri Akışı (Data Flow)

En karmaşık görünen ama en standart olan kısım burasıdır. Tüm veriler `web/src/lib/slices/contentSlice.ts` üzerinden geçer.

### A. Backend Route & Migration (Veri Kurtarma)
- **Dosya:** `backend/src/routes/sectionContent.js`
- **İşleyiş:** Admin paneli `home_settings` verisini (`GET /api/section-content/home_settings`) çağırdığında DB'de bu veri yoksa (çünkü eskiden `globalSettings` içindeydi), sistem otomatik olarak eskisini bulur, içindeki Hero/Featured verilerini kopyalar, yeni `home_settings` isminde kaydeder ve Frontend'e yeni halini yollar. Böylece eski eklenen veriler **kaybolmaz**.

### B. Frontend Redux Thunks (`contentSlice.ts`)
Modüler yapıda her bölümün iki GET thunk'ı, bir PUT thunk'ı vardır:
1.  **Public GET:** `fetchHomeSettings` -> `GET /api/public/section-content/home_settings` (Kullanıcı tarafı anasayfa için, cachesiz/hızlı).
2.  **Admin GET:** `fetchAdminHomeSettings` -> `GET /api/section-content/home_settings` (Backend'deki taşıma/göç (migration) mantığını çalıştıran asıl yetkili istek).
3.  **Admin PUT:** `updateHomeSettings` -> `PUT /api/section-content/home_settings` (Kaydetme isteği).

### C. Sayfa Yüklenince Neler Oluyor? (`page.tsx`)
```tsx
// page.tsx içinde
useEffect(() => {
    dispatch(fetchGlobalSettings());
    dispatch(fetchAdminHomeSettings());         // Admin endpointini çağır ki göç varsa tetiklensin!
    dispatch(fetchAdminPopularCollections());
}, [dispatch]);
```
Bu sayede admin paneline girdiğin an, veriler backend'den çekilip Redux Store'a (State) depolanmış olur.

### D. Modal'lar Redux'ı Nasıl Kullanıyor?
Örn: `BannerEditorModal.tsx`
1.  **Veriyi Okuma:** `const { homeSettings } = useAppSelector((state) => state.content);` diyerek hazır state'i alır.
2.  **Değişikliği Local State'e Alma:** Kullanıcı modalda yazıları değiştirir (`setFormData(...)`).
3.  **Kaydetme (Disptach):** Kaydet tuşuna basınca tüm objeyi parçalayıp (`...homeSettings`) güncellenen kısmıyla birlikte `dispatch(updateHomeSettings(obj))` komutunu fırlatır.

---

## 4. Yeni Bir Ayar Bölümü (Örn: About Page) Nasıl Eklenir?

Yeni bir sayfanın admin ayarlarını eklemek çok basittir. Adım adım:

### Adım 1: Redux Slice Güncellemesi (`contentSlice.ts`)
1.  `interface AboutSettings { title: string; image: string; }` oluştur.
2.  `ContentState` içine `aboutSettings: AboutSettings | null;` ekle.
3.  `initialState` kısmına default değerlerini ekle.
4.  3 tane AsyncThunk yarat: `fetchAboutSettings`, `fetchAdminAboutSettings`, `updateAboutSettings`. (Home olanları kopyalayıp isimlerini ve endpoint `about_settings` kısmını değiştirmen yeterli.)
5.  `extraReducers` içerisine builder metodlarıyla bu thunkların yüklendiğinde (`.fulfilled`) state'i güncelleyecek karşılıklarını yaz.

### Adım 2: Admin Sidebar'a Eklemek (`layout-settings/page.tsx`)
1.  `PAGES` array'ine `about` objesini eklersin.
2.  `INITIAL_SECTIONS` objesinde `about` altındaki modüllerini belirlersin (örn: id: `about_hero`, label: `About Top Banner`).
3.  Sayfanın başındaki `useEffect` içine `dispatch(fetchAdminAboutSettings())` eklersin ki verilere sayfa açıldığında ulaşılabilsin.
4.  `handleEditSection(sectionId)` fonksiyonuna `if (sectionId === 'about_hero') setActiveModal('about_hero');` eklersin (Kaleme tıklayınca bu modal tetiklensin diye).
5.  Sayfanın altındaki `<AnimatePresence>` componentine bir if bloğu açarsın: `{activeModal === 'about_hero' && <AboutEditorModal onClose={...} />}`

### Adım 3: Modal Componentini Yaratmak
`_components/About/AboutEditorModal.tsx` isminde bir dosya açıp standart Modal iskeletini kopyalarsın. İçinde:
- `useAppSelector` ile `aboutSettings` çekilir, form doldurulur.
- Kaydedilince `dispatch(updateAboutSettings)` çalıştırılır.

**Bitti.** Backend tarafında ekstra hiçbir Mongoose Modeli oluşturmana, Route yazmana gerek yoktur. Evrensel `/api/section-content/:identifier` sistemi yeni veriyi json olarak kabul edip otomatik olarak `about_settings` ismiyle DB'ye kaydedecektir.

---

## 5. Global Bileşen Hafızası (Global Component Memory)

Bazı bileşenler (Advantage Area, Campaigns, Journal, Featured Image Banner) birden fazla sayfada (Anasayfa, Ürün Sayfası vb.) kullanılabilir. Kullanıcı deneyimini artırmak için bu bileşenler **"Hafızalı"** (Global) hale getirilmiştir.

- **Mantık:** Bir bileşen Anasayfa'da düzenlendiğinde, Ürün Sayfasına eklendiğinde de aynı verilerle gelir.
- **Tek Veri Kaynağı:** Bu bileşenlerin verileri her zaman `home_settings` (veya ortak bir global havuz) üzerinden yönetilir. 
- **Admin Senkronizasyonu:** `layout-settings/page.tsx` içindeki `handleEditSection` fonksiyonu, bu bileşenler için hangi sayfada olursanız olun aynı "Global Modal"ı açar.
- **Frontend Yükleme:** Ürün sayfası gibi alt sayfalar, bu global bileşenleri render edebilmek için kendi ayarlarının yanında `fetchHomeSettings` thunk'ını da çalışarak ortak havuzdaki verileri çeker.

---

## 6. Evrensel Sayfa Render Yapısı (Universal Rendering)

Sistem artık her bileşeni her sayfada render edebilecek esnekliktedir.

- **`renderSection(id)` Fonksiyonu:** Hem `app/page.tsx` hem de `app/products/[id]/page.tsx` içinde bulunur. Bileşen ID'sine göre ilgili React bileşenini çağırır.
- **Koşullu Gizleme (Strict Hidden Sections):** Bir bileşen `sectionOrder` (Sıralama) listesinde olsa bile, eğer `hiddenSections` (Gizli Bölümler) listesindeyse kesinlikle render edilmez. Admin panelindeki "Sil" (X) butonu bu listeyi günceller.
- **Cross-Page Support:** Ürün detay sayfasında Anasayfa bileşenleri (Hero, Collections), Anasayfa'da ise Ürün bileşenleri (Related Products) render edilebilir. Veri eksikliği durumunda bileşenler "null" döner veya korumalı (safe-guard) modda çalışır.
