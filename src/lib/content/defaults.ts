import { heroImages, catalogProducts } from '@/lib/data/catalog';
import type { Lang } from '@/lib/i18n/dictionaries';

export type ContentImage = { image_url: string; alt: string };
export type CollectionSubcategory = { slug: string; title: string };
export type CollectionContentItem = { slug: string; title: string; copy: string; image_url: string; subcategories: Array<CollectionSubcategory | string> };
export type TrustContentItem = { number: string; title: string; body: string };
export type AboutFeature = { icon: string; title: string; body: string };
export type Testimonial = { name: string; role: string; src: string; quote: string };
type DeepPartial<T> = T extends readonly unknown[] ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export type SiteContent = {
  global: {
    brand: ContentImage;
    nav: { home: string; catalog: string; collection: string; contact: string; about: string };
    header: { search: string; searchPlaceholder: string; pouch: string };
    footer: { brand: string; tagline: string; explore: string; service: string; visit: string; ourStory: string; contact: string; shipping: string; careGuide: string; locations: string; mapQuery: string; handcrafted: string; rights: string; privacy: string; privacyHref: string; terms: string; termsHref: string; cookies: string; cookiesHref: string; phone: string; phoneHref: string; email: string; whatsapp: string; instagram: string };
    cart: { title: string; item: string; items: string; close: string; emptyTitle: string; emptyBody: string; exploreCatalog: string; almostYours: string; orderDetails: string; fullName: string; delivery: string; notes: string; subtotal: string; estimatedShipping: string; calculatedViaWhatsapp: string; continueOrder: string; clearPouch: string; confirmation: string };
  };
  home: {
    introEyebrow: string; introH1a: string; introH1b: string; introBody: string; introCta: string;
    featuredEyebrow: string; featuredTitle: string; featuredCta: string;
    lookbook: { eyebrow: string; title: string; body: string };
    noteEyebrow: string; noteH2a: string; noteH2b: string; noteBody: string; noteCta: string;
    trust: TrustContentItem[];
  };
  collection: {
    hero: { eyebrow: string; h1a: string; h1b: string; body: string; collectionLink: string; scroll: string; image: ContentImage };
    explore: { eyebrow: string; title: string; body: string };
    items: CollectionContentItem[]; cardLabel: string; exploreCta: string; megaMenuCta: string;
  };
  catalog: {
    hero: { eyebrow: string; h1a: string; h1b: string; body: string };
    ui: { filter: string; refine: string; searchPlaceholder: string; reset: string; productType: string; leatherGrade: string; color: string; priceRange: string; subcategory: string; allSubcategories: string; allTypes: string; allGrades: string; showing: string; piecesFound: string; noPieces: string; noPiecesBody: string; resetFilters: string; sortBy: string; featured: string; priceLow: string; priceHigh: string; loadMore: string; trendingKicker: string; trendingTitle: string; shopByKind: string; pieces: string; chooseDensity: string; gridLabel: string };
    product: { home: string; guarantee: string; handcrafted: string; shipping: string; rating: string; color: string; size: string; sizeGuide: string; emboss: string; embossOptional: string; embossPlaceholder: string; addToPouch: string; outOfStock: string; materialTitle: string; materialBody: string; careTitle: string; careBody: string; shippingTitle: string; shippingBody: string; completeKicker: string; completeTitle: string };
    categories: Record<string, string>;
  };
  contact: {
    hero: { eyebrow: string; h1a: string; h1b: string; body: string };
    labels: { address: string; phone: string; email: string; hours: string; showOnMap: string; showingOnMap: string; selectedAtelier: string; whatsapp: string };
    whatsappNumber: string; whatsappMessage: string;
  };
  about: {
    hero: { eyebrow: string; title: string };
    features: AboutFeature[];
    beginning: { eyebrow: string; title: string; body1: string; body2: string; image: ContentImage };
    belief: { eyebrow: string; title: string; body1: string; body2: string; image: ContentImage };
    testimonial: { title: string; intro: string };
    testimonials: Testimonial[];
    shopgram: { title: string; intro: string; items: Array<ContentImage & { label: string; icon: string }> };
  };
};

const productImage = (id: string) => catalogProducts.find((product) => product.id === id)?.images[0] ?? heroImages[0];

const en: SiteContent = {
  global: {
    brand: { image_url: '/praba-logo.svg', alt: 'Praba Leather Bali' },
    nav: { home: 'Home', catalog: 'Catalog', collection: 'Collection', contact: 'Contact', about: 'About Us' },
    header: { search: 'Search', searchPlaceholder: 'Search the collection', pouch: 'Pouch' },
    footer: { brand: 'PRABA LEATHER BALI', tagline: 'A small house of Balinese artisans crafting full-grain leather goods made to carry your story — slowly, honestly, by hand.', explore: 'Explore', service: 'Service', visit: 'Visit', ourStory: 'Our Story', contact: 'Contact', shipping: 'Shipping & Returns', careGuide: 'Care Guide', locations: 'Canggu · Ubud · Seminyak', mapQuery: 'Canggu Bali', handcrafted: 'Handcrafted in Bali, Indonesia · A workshop of Balinese artisans.', rights: 'All rights reserved.', privacy: 'Privacy Policy', privacyHref: '/privacy/', terms: 'Terms of Service', termsHref: '/terms/', cookies: 'Cookies', cookiesHref: '/cookies/', phone: '+62 818 0459 5666', phoneHref: '+6281804595666', email: 'hello@prabaleather.com', whatsapp: '6281804595666', instagram: 'https://instagram.com' },
    cart: { title: 'Your Order Pouch', item: 'item', items: 'items', close: 'Close order pouch', emptyTitle: 'Your pouch is empty', emptyBody: 'Explore the collection and save a piece for your next story.', exploreCatalog: 'Explore catalog', almostYours: 'Almost yours', orderDetails: 'Order Details', fullName: 'Your full name', delivery: 'Delivery address / country', notes: 'Special notes for artisan', subtotal: 'Subtotal', estimatedShipping: 'Estimated shipping', calculatedViaWhatsapp: 'Calculated via WhatsApp', continueOrder: 'Continue Order to WhatsApp', clearPouch: 'Clear pouch', confirmation: 'We’ll confirm availability and shipping costs with you directly.' },
  },
  home: {
    introEyebrow: 'The Praba point of view', introH1a: 'Crafted for journeys,', introH1b: 'built for character.', introBody: 'Rooted in Kuta, Bali. Over 30+ years of craftsmanship bringing you 100% genuine leather bags, boots, and sandals at the best value on the island.', introCta: 'Explore the collection',
    featuredEyebrow: 'Most wanted', featuredTitle: 'Trending Collections', featuredCta: 'View all pieces',
    lookbook: { eyebrow: 'A considered wardrobe', title: 'Curated Looks', body: 'Objects made to move together, each one carrying the warmth of the hand that shaped it.' },
    noteEyebrow: 'The Praba promise', noteH2a: 'Made slowly.', noteH2b: 'Worn forever.', noteBody: 'We believe the best things reveal themselves over time. Your leather will darken, soften, and become entirely your own.', noteCta: 'Discover the craft',
    trust: [
      { number: '01', title: '100% Full-Grain Leather', body: 'Finest cowhide sourced for its natural texture and uncompromising durability. Uncorrected grain ensures every piece is unique.' },
      { number: '02', title: 'Master Balinese Artisans', body: 'Hand-stitched with traditional wax-thread techniques passed down through generations in local workshops.' },
      { number: '03', title: 'Lifetime Patina', body: 'Designed to age gracefully, developing a rich, personalized patina that tells the story of its journey with you.' },
    ],
  },
  collection: {
    hero: { eyebrow: 'Praba Leather Bali', h1a: 'The', h1b: 'Collection', body: 'Considered leather pieces for everyday rituals, made slowly in Bali and designed to live with you.', collectionLink: 'Collection', scroll: 'Scroll to explore', image: { image_url: heroImages[2], alt: 'Praba Leather Bali collection' } },
    explore: { eyebrow: 'Explore by kind', title: 'Our collection', body: 'Discover the right shape for your day, from considered carry goods to leather layers built for the road.' },
    items: [
      { slug: 'bags', title: 'Bags', copy: 'Carry pieces with quiet structure.', image_url: productImage('ubud-weave-tote'), subcategories: [{ slug: 'totes', title: 'Totes' }, { slug: 'briefcases', title: 'Briefcases' }, { slug: 'everyday-bags', title: 'Everyday Bags' }, { slug: 'travel-bags', title: 'Travel Bags' }] },
      { slug: 'boots', title: 'Footwear', copy: 'Built for long roads and longer stories.', image_url: productImage('duke-heritage-boot'), subcategories: [{ slug: 'heritage-boots', title: 'Heritage Boots' }, { slug: 'everyday-boots', title: 'Everyday Boots' }, { slug: 'lace-up-boots', title: 'Lace-up Boots' }] },
      { slug: 'wallets', title: 'Wallets', copy: 'Small leather goods, made personal.', image_url: productImage('artisan-cardholder'), subcategories: [{ slug: 'cardholders', title: 'Cardholders' }, { slug: 'bifold-wallets', title: 'Bifold Wallets' }, { slug: 'travel-wallets', title: 'Travel Wallets' }] },
      { slug: 'accessories', title: 'Accessories', copy: 'The finishing details, made by hand.', image_url: productImage('classic-dress-belt'), subcategories: [{ slug: 'belts', title: 'Belts' }, { slug: 'care-goods', title: 'Care Goods' }, { slug: 'small-leather-goods', title: 'Small Leather Goods' }] },
      { slug: 'jackets', title: 'Jackets', copy: 'Supple protection with a tailored edge.', image_url: productImage('onyx-moto-jacket'), subcategories: [{ slug: 'moto-jackets', title: 'Moto Jackets' }, { slug: 'overshirts', title: 'Overshirts' }, { slug: 'outerwear', title: 'Outerwear' }] },
    ], cardLabel: 'Collection', exploreCta: 'Explore', megaMenuCta: 'View all',
  },
  catalog: {
    hero: { eyebrow: 'The collection', h1a: 'The Handcrafted', h1b: 'Collection', body: 'Each piece is a study in natural texture, considered utility, and the quiet confidence of something made well.' },
    ui: { filter: 'Filter', refine: 'Refine selection', searchPlaceholder: 'Search pieces', reset: 'Reset', productType: 'Product type', leatherGrade: 'Leather grade', color: 'Color', priceRange: 'Price range', subcategory: 'Subcategory', allSubcategories: 'All pieces', allTypes: 'All types', allGrades: 'All grades', showing: 'Showing the collection', piecesFound: 'pieces found', noPieces: 'No pieces found', noPiecesBody: 'Try widening your filters to discover more of the collection.', resetFilters: 'Reset filters', sortBy: 'Sort by', featured: 'Featured', priceLow: 'Price: Low to high', priceHigh: 'Price: High to low', loadMore: 'Load more pieces', trendingKicker: 'Most wanted', trendingTitle: 'Trending now', shopByKind: 'Shop by kind', pieces: 'pieces', chooseDensity: 'Choose product density', gridLabel: 'Show a product grid' },
    product: { home: 'Home', guarantee: '100% Genuine Leather Guarantee', handcrafted: 'Handcrafted in Bali', shipping: 'Free express shipping within Indonesia', rating: '5.0 · 24 artisan reviews', color: 'Color', size: 'Size (EU)', sizeGuide: 'Size guide', emboss: 'Add custom initials stamp', embossOptional: '(optional)', embossPlaceholder: "e.g. 'A.P'", addToPouch: 'Deal & Order via WhatsApp', outOfStock: 'Out of stock', materialTitle: 'Material specifications', materialBody: 'Crafted from 100% full-grain cowhide, featuring durable hand stitching and solid brass hardware.', careTitle: 'Leather care & patina guide', careBody: 'Wipe clean with a damp cloth. Condition quarterly with natural beeswax to maintain moisture and encourage a rich, unique patina.', shippingTitle: 'Shipping & international delivery', shippingBody: 'Free express shipping within Indonesia. International shipping is calculated at checkout via DHL Express.', completeKicker: 'Considered companions', completeTitle: 'Complete The Look' },
    categories: { all: 'All types', boots: 'Footwear', bags: 'Bags', wallets: 'Wallets', accessories: 'Accessories', jackets: 'Jackets' },
  },
  contact: {
    hero: { eyebrow: 'Visit us', h1a: 'Find Us', h1b: 'in Bali', body: 'Three ateliers across the island, one quiet craft. Select a store to load it on the map, or drop by to feel the leather, commission a bespoke piece, or simply say hello.' },
    labels: { address: 'Address', phone: 'Phone', email: 'Email', hours: 'Hours', showOnMap: 'Show on map', showingOnMap: 'Showing on map', selectedAtelier: 'Selected atelier', whatsapp: 'Message us on WhatsApp' },
    whatsappNumber: '6281804595666', whatsappMessage: 'Hello Praba Leather, I would like to enquire about a piece.',
  },
  about: {
    hero: { eyebrow: 'Our story', title: 'About Us' },
    features: [
      { icon: 'palette', title: 'A wide palette of hides & hues', body: 'Full-grain leathers in tones chosen to quietly carry your individuality — never loud, always yours.' },
      { icon: 'handyman', title: 'Hand-stitched in Bali', body: 'Cut and sewn by Balinese artisans who pour patience and pride into every single seam.' },
      { icon: 'diamond', title: 'Genuine full-grain leather', body: 'Only premium hides, selected to deepen in character the more you live with them.' },
      { icon: 'public', title: 'Made to travel the world', body: 'Understated designs that belong just as much in Canggu as they do wherever your story heads next.' },
    ],
    beginning: { eyebrow: 'Est. in Bali', title: 'The beginning of our story', body1: 'Praba began in a small Bali workshop, where a single artisan set out to prove that leather could be quiet, honest, and built to last. What started as one pair of hands and a love for the craft slowly gathered others — cutters, stitchers, finishers — each carrying the same belief that something made slowly is something made well.', body2: "Over the years those hands became a studio, and that studio became three ateliers across the island. The work has grown, but the rule hasn't changed: full-grain hides, hand-finishing, and the patience to let each piece earn its character.", image: { image_url: '', alt: 'Artisan hands shaping full-grain leather in the Praba atelier' } },
    belief: { eyebrow: 'What we believe', title: 'Who are we?', body1: 'We think the things you carry should tell your story, not silence it. Praba is a small house of Balinese artisans making leather goods that feel personal — pieces you live with every day, and pieces that turn a head or two.', body2: "Every bag, wallet, and belt is cut from genuine full-grain leather and finished by hand. We keep our palettes diverse and our lines restrained, so whether your taste runs bold or understated, what you carry is confidence, elegance, and a story that's distinctly yours.", image: { image_url: '', alt: 'Three friends each holding a Praba leather bag' } },
    testimonial: { title: 'Happy clients', intro: 'A few words from the people who carry Praba.' },
    testimonials: [
      { name: 'Julia', role: 'Canggu', src: '/samples/sample-main.jpeg', quote: 'We only came in to look and left with three. The team was warm, and every piece had real weight to it.' },
      { name: 'Maya', role: 'Singapore', src: '/samples/sample-hover.jpeg', quote: 'I commissioned a bespoke weekender and the atelier kept me posted at every step. Eight weeks later it arrived, better than the sketch.' },
      { name: 'Daniel', role: 'Sydney', src: '', quote: 'Full-grain, hand-finished, and honestly priced. Two years of daily wear and my holdall looks better than the day I bought it.' },
      { name: 'Ayu', role: 'Ubud', src: '', quote: 'The leather smells and feels like it will outlive me. I have already placed my second order for a belt and card holder.' },
      { name: 'Theo', role: 'Berlin', src: '', quote: 'Quiet, understated, beautifully made. Exactly the kind of thing you carry for a decade, not a season.' },
    ],
    shopgram: { title: 'Shop Gram', intro: 'Inspire and be inspired — from one well-made piece to the next.', items: [
      { image_url: '/samples/sample-main.jpeg', alt: 'Praba quilted crossbody bag', label: '', icon: '' },
      { image_url: '', alt: 'Atelier detail — stitching close-up', label: 'Atelier', icon: 'handyman' },
      { image_url: '/samples/sample-hover.jpeg', alt: 'Praba bag worn over the shoulder', label: '', icon: '' },
      { image_url: '', alt: 'Leather swatches and color story', label: 'Swatches', icon: 'palette' },
      { image_url: '', alt: 'A finished piece on the workbench', label: 'The bench', icon: 'cut' },
    ] },
  },
};

const idOverrides: DeepPartial<SiteContent> = {
  global: { nav: { home: 'Beranda', catalog: 'Katalog', collection: 'Koleksi', contact: 'Kontak', about: 'Tentang Kami' }, header: { search: 'Cari', searchPlaceholder: 'Cari di koleksi', pouch: 'Pouch' }, footer: { ...en.global.footer, tagline: 'Rumah kecil pengrajin Bali yang membuat barang kulit full-grain untuk menemani cerita Anda — perlahan, jujur, dengan tangan.', explore: 'Jelajahi', service: 'Layanan', visit: 'Kunjungi', ourStory: 'Cerita Kami', contact: 'Kontak', shipping: 'Pengiriman & Pengembalian', careGuide: 'Panduan Perawatan', handcrafted: 'Dibuat tangan di Bali, Indonesia · Rumah pengrajin Bali.', rights: 'Hak cipta dilindungi.', privacy: 'Kebijakan Privasi', terms: 'Ketentuan Layanan', cookies: 'Cookie' }, cart: { ...en.global.cart, title: 'Pouch Pesanan Anda', emptyTitle: 'Pouch Anda kosong', emptyBody: 'Jelajahi koleksi dan simpan piece untuk cerita Anda berikutnya.', exploreCatalog: 'Jelajahi katalog', almostYours: 'Hampir jadi milik Anda', orderDetails: 'Detail Pesanan', fullName: 'Nama lengkap Anda', delivery: 'Alamat / negara pengiriman', notes: 'Catatan khusus untuk pengrajin', subtotal: 'Subtotal', estimatedShipping: 'Perkiraan pengiriman', calculatedViaWhatsapp: 'Dihitung melalui WhatsApp', continueOrder: 'Lanjutkan Pesanan via WhatsApp', clearPouch: 'Kosongkan pouch', confirmation: 'Kami akan mengonfirmasi ketersediaan dan biaya pengiriman langsung kepada Anda.' } },
  home: { ...en.home, introEyebrow: 'Sudut pandang Praba', introH1a: 'Dibuat untuk perjalanan,', introH1b: 'tumbuh berkarakter.', introBody: 'Berakar di Kuta, Bali. Lebih dari 30 tahun kerajinan menghadirkan tas, sepatu, dan sandal kulit 100% asli dengan nilai terbaik di pulau ini.', featuredEyebrow: 'Paling dicari', featuredTitle: 'Koleksi Trending', noteEyebrow: 'Janji Praba', noteH2a: 'Dibuat perlahan.', noteH2b: 'Dipakai selamanya.', noteBody: 'Kami percaya hal terbaik menyatakan dirinya seiring waktu. Kulit Anda akan menggelap, melembut, dan menjadi milik Anda sepenuhnya.', lookbook: { eyebrow: 'Lemari yang dipertimbangkan', title: 'Look Terpilih', body: 'Objek yang dibuat untuk bergerak bersama, masing-masing membawa kehangatan tangan yang membentuknya.' } },
  collection: { ...en.collection, hero: { ...en.collection.hero, h1a: 'Sang', h1b: 'Koleksi', body: 'Barang kulit yang dipertimbangkan untuk ritual sehari-hari, dibuat perlahan di Bali dan dirancang untuk menemani Anda.' } },
  catalog: { ...en.catalog, hero: { ...en.catalog.hero, eyebrow: 'Koleksi', h1a: 'Koleksi Buatan', h1b: 'Tangan', body: 'Setiap potongan adalah studi tekstur alami, kegunaan yang dipertimbangkan, dan kepercayaan diri yang tenang dari sesuatu yang dibuat dengan baik.' } },
  contact: { ...en.contact, hero: { ...en.contact.hero, eyebrow: 'Kunjungi kami', h1a: 'Temui Kami', h1b: 'di Bali', body: 'Tiga atelier di seluruh pulau, satu kerajinan yang tenang. Pilih toko untuk memuatnya di peta, atau mampir meraba kulitnya, memesan piece bespoke, atau sekadar menyapa.' } },
  about: { ...en.about, hero: { eyebrow: 'Cerita kami', title: 'Tentang Kami' } },
};

export function mergeSiteContent<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) return JSON.parse(JSON.stringify(base)) as T;
  const result = { ...(base as object), ...(override as object) } as T;
  for (const key of Object.keys(base as object)) {
    const baseValue = (base as Record<string, unknown>)[key];
    const overrideValue = (override as Record<string, unknown>)[key];
    if (baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue) && overrideValue && typeof overrideValue === 'object' && !Array.isArray(overrideValue)) {
      (result as Record<string, unknown>)[key] = mergeSiteContent(baseValue, overrideValue as never);
    }
  }
  return result;
}

export function getDefaultContent(lang: Lang): SiteContent {
  return mergeSiteContent<SiteContent>(en, lang === 'id' ? idOverrides : undefined);
}

export function normalizeCollectionSubcategory(value: CollectionSubcategory | string): CollectionSubcategory {
  if (typeof value !== 'string') return value;
  return {
    title: value,
    slug: value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  };
}

export const CONTENT_SECTIONS = ['global', 'home', 'collection', 'catalog', 'contact', 'about'] as const;
export type ContentSection = typeof CONTENT_SECTIONS[number];
