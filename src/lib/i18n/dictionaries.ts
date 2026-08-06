export type Lang = 'en' | 'id';

export const LANGS: Lang[] = ['en', 'id'];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_LABELS: Record<Lang, string> = { en: 'EN', id: 'ID' };

type Dict = Record<string, string>;

const en: Dict = {
  // nav
  'nav.home': 'Home',
  'nav.catalog': 'Catalog',
  'nav.contact': 'Contact',
  'nav.about': 'About Us',
  'nav.collection': 'Collection',
  // header actions
  'header.search': 'Search',
  'header.searchPlaceholder': 'Search the collection',
  'header.openSearch': 'Search catalog',
  'header.pouch': 'Pouch',
  'header.toggleNav': 'Toggle navigation',
  // footer
  'footer.tagline': 'A small house of Balinese artisans crafting full-grain leather goods made to carry your story — slowly, honestly, by hand.',
  'footer.explore': 'Explore',
  'footer.service': 'Service',
  'footer.visit': 'Visit',
  'footer.ourStory': 'Our Story',
  'footer.contact': 'Contact',
  'footer.shipping': 'Shipping & Returns',
  'footer.careGuide': 'Care Guide',
  'footer.locations': 'Canggu · Ubud · Seminyak',
  'footer.handcrafted': 'Handcrafted in Bali, Indonesia · A workshop of Balinese artisans.',
  'footer.grain': 'Full-grain · Hand-stitched',
  'footer.rights': 'All rights reserved.',
  'footer.privacy': 'Privacy Policy',
  'footer.terms': 'Terms of Service',
  'footer.cookies': 'Cookies',
  // home
  'home.introEyebrow': 'The Praba point of view',
  'home.introH1a': 'Crafted for journeys,',
  'home.introH1b': 'built for character.',
  'home.introBody': 'Rooted in Kuta, Bali. Over 30+ years of craftsmanship bringing you 100% genuine leather bags, boots, and sandals at the best value on the island.',
  'home.featuredEyebrow': 'Most wanted',
  'home.featuredTitle': 'Trending Collections',
  'home.noteEyebrow': 'The Praba promise',
  'home.noteH2a': 'Made slowly.',
  'home.noteH2b': 'Worn forever.',
  'home.noteBody': 'We believe the best things reveal themselves over time. Your leather will darken, soften, and become entirely your own.',
  // catalog hero
  'catalog.eyebrow': 'The collection',
  'catalog.h1a': 'The Handcrafted',
  'catalog.h1b': 'Collection',
  'catalog.body': 'Each piece is a study in natural texture, considered utility, and the quiet confidence of something made well.',
  // about hero
  'about.eyebrow': 'Our story',
  'about.h1': 'About Us',
  // contact hero
  'contact.eyebrow': 'Visit us',
  'contact.h1a': 'Find Us',
  'contact.h1b': 'in Bali',
  'contact.body': 'Three ateliers across the island, one quiet craft. Select a store to load it on the map, or drop by to feel the leather, commission a bespoke piece, or simply say hello.',
  // collection hero
  'collection.eyebrow': 'Praba Leather Bali',
  'collection.h1a': 'The',
  'collection.h1b': 'Collection',
  'collection.body': 'Considered leather pieces for everyday rituals, made slowly in Bali and designed to live with you.',
  'collection.heroCollection': 'Collection',
  // CTAs
  'cta.addToPouch': 'Add to pouch',
  'cta.viewPiece': 'View piece',
  'cta.loadMore': 'Load more pieces',
  'cta.continueOrder': 'Continue Order to WhatsApp',
  'cta.exploreCatalog': 'Explore catalog',
  'cta.exploreCollection': 'Explore the collection',
  'cta.viewAll': 'View all pieces',
  'cta.discover': 'Discover the craft',
};

const id: Dict = {
  'nav.home': 'Beranda',
  'nav.catalog': 'Katalog',
  'nav.contact': 'Kontak',
  'nav.about': 'Tentang Kami',
  'nav.collection': 'Koleksi',
  'header.search': 'Cari',
  'header.searchPlaceholder': 'Cari di koleksi',
  'header.openSearch': 'Cari katalog',
  'header.pouch': 'Pouch',
  'header.toggleNav': 'Buka navigasi',
  'footer.tagline': 'Rumah kecil pengrajin Bali yang membuat barang kulit full-grain untuk menemani cerita Anda — perlahan, jujur, dengan tangan.',
  'footer.explore': 'Jelajahi',
  'footer.service': 'Layanan',
  'footer.visit': 'Kunjungi',
  'footer.ourStory': 'Cerita Kami',
  'footer.contact': 'Kontak',
  'footer.shipping': 'Pengiriman & Pengembalian',
  'footer.careGuide': 'Panduan Perawatan',
  'footer.locations': 'Canggu · Ubud · Seminyak',
  'footer.handcrafted': 'Dibuat tangan di Bali, Indonesia · Rumah pengrajin Bali.',
  'footer.grain': 'Full-grain · Jahit tangan',
  'footer.rights': 'Hak cipta dilindungi.',
  'footer.privacy': 'Kebijakan Privasi',
  'footer.terms': 'Ketentuan Layanan',
  'footer.cookies': 'Cookie',
  'home.introEyebrow': 'Sudut pandang Praba',
  'home.introH1a': 'Dibuat untuk perjalanan,',
  'home.introH1b': 'tumbuh berkarakter.',
  'home.introBody': 'Berakar di Kuta, Bali. Lebih dari 30 tahun kerajinan menghadirkan tas, sepatu, dan sandal kulit 100% asli dengan nilai terbaik di pulau ini.',
  'home.featuredEyebrow': 'Paling dicari',
  'home.featuredTitle': 'Koleksi Trending',
  'home.noteEyebrow': 'Janji Praba',
  'home.noteH2a': 'Dibuat perlahan.',
  'home.noteH2b': 'Dipakai selamanya.',
  'home.noteBody': 'Kami percaya hal terbaik menyatakan dirinya seiring waktu. Kulit Anda akan menggelap, melembut, dan menjadi milik Anda sepenuhnya.',
  'catalog.eyebrow': 'Koleksi',
  'catalog.h1a': 'Koleksi Buatan',
  'catalog.h1b': 'Tangan',
  'catalog.body': 'Setiap potongan adalah studi tekstur alami, kegunaan yang dipertimbangkan, dan kepercayaan diri yang tenang dari sesuatu yang dibuat dengan baik.',
  'about.eyebrow': 'Cerita kami',
  'about.h1': 'Tentang Kami',
  'contact.eyebrow': 'Kunjungi kami',
  'contact.h1a': 'Temui Kami',
  'contact.h1b': 'di Bali',
  'contact.body': 'Tiga atelier di seluruh pulau, satu kerajinan yang tenang. Pilih toko untuk memuatnya di peta, atau mampir meraba kulitnya, memesan piece bespoke, atau sekadar menyapa.',
  'collection.eyebrow': 'Praba Leather Bali',
  'collection.h1a': 'Sang',
  'collection.h1b': 'Koleksi',
  'collection.body': ' barang kulit yang dipertimbangkan untuk ritual sehari-hari, dibuat perlahan di Bali dan dirancak untuk menemani Anda.',
  'collection.heroCollection': 'Koleksi',
  'cta.addToPouch': 'Masukkan ke pouch',
  'cta.viewPiece': 'Lihat produk',
  'cta.loadMore': 'Muat lebih banyak',
  'cta.continueOrder': 'Lanjutkan Pesanan ke WhatsApp',
  'cta.exploreCatalog': 'Jelajahi katalog',
  'cta.exploreCollection': 'Jelajahi koleksi',
  'cta.viewAll': 'Lihat semua',
  'cta.discover': 'Temukan kerajinannya',
};

export const dicts: Record<Lang, Dict> = { en, id };

export function isValidLang(value: string | undefined): value is Lang {
  return !!value && (LANGS as string[]).includes(value);
}
