import type { Lang } from '@/lib/i18n/dictionaries';

export type LegalSlug = 'privacy' | 'terms' | 'cookies';
export type LegalSection = { heading: string; paragraphs?: string[]; bullets?: string[] };
export type LegalPolicy = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedLabel: string;
  updated: string;
  notice: string;
  sections: LegalSection[];
  contactHeading: string;
  contactBody: string;
};

const en: Record<LegalSlug, LegalPolicy> = {
  privacy: {
    eyebrow: 'Your information',
    title: 'Privacy Policy',
    intro: 'This policy explains what Praba Leather Bali collects, why we use it, and the choices available to you when you browse our collection or contact the atelier.',
    updatedLabel: 'Effective from',
    updated: '10 August 2026',
    notice: 'This policy is written for the current Praba Leather Bali storefront. It is an information notice, not a substitute for advice about your specific legal obligations or rights.',
    sections: [
      { heading: '1. Who we are', paragraphs: ['Praba Leather Bali is a Bali-based leather goods studio and online storefront. For privacy questions or requests, contact our team at {{contactEmail}} or {{contactPhone}}.'] },
      { heading: '2. Information we receive', paragraphs: ['We receive information you choose to share when you ask about a product, build a pouch, request personalization, or continue an order through WhatsApp. This can include your name, region or delivery country, phone number, email address, selected products and variants, custom embossing text, and any message you send us.', 'Our hosting, security, and content services may also receive technical information such as your IP address, browser type, device type, referring page, and the pages or assets requested. We use this information to keep the storefront available and secure.'] },
      { heading: '3. How we use information', bullets: ['Respond to product, store, personalization, and shipping enquiries.', 'Prepare the order summary you choose to send to our WhatsApp business chat.', 'Confirm availability, prices, shipping options, and custom work.', 'Maintain, troubleshoot, secure, and improve the storefront and its content.', 'Meet accounting, fraud-prevention, legal, and dispute-resolution requirements where applicable.'] },
      { heading: '4. WhatsApp and other links', paragraphs: ['Selecting an order or contact button opens a WhatsApp conversation using the number shown on this site. The information in that conversation is then processed by WhatsApp and by Praba Leather Bali to respond to you and fulfil an enquiry. WhatsApp has its own privacy terms, so please review them before sending sensitive information.', 'Our storefront also links to Google Maps, Instagram, email, and telephone services. Those services operate independently and may process information under their own policies.'] },
      { heading: '5. Storage and retention', paragraphs: ['Pouch contents and currency preferences are stored in your browser so the storefront can remember them. They are not sent to Praba Leather Bali until you choose to share an order or enquiry. Messages and order details shared with us are retained only for as long as needed to respond, fulfil, support, reconcile, or resolve the matter, or to meet a legal obligation.'] },
      { heading: '6. Sharing and international processing', paragraphs: ['We do not sell your personal information. We may share the minimum information needed with service providers that host, secure, operate, or deliver parts of the storefront, with shipping partners when an order is confirmed, or when disclosure is required by law. Some providers may process information outside Indonesia; we take reasonable steps to use reputable providers and limit the information shared.'] },
      { heading: '7. Your choices and rights', paragraphs: ['Depending on where you live and which law applies, you may ask us to access, correct, delete, restrict, or stop using personal information, or to withdraw consent where processing is based on consent. You can also ask how we use your information or object to direct marketing. Contact {{contactEmail}} with the request and the email or phone number used in the conversation so we can verify it safely.'] },
      { heading: '8. Security and children', paragraphs: ['We use reasonable administrative and technical measures for the information we control, but no internet transmission or storage system can be guaranteed completely secure. Our storefront is not directed at children under 16, and we do not knowingly request their personal information.'] },
      { heading: '9. Changes to this policy', paragraphs: ['We may update this page when the storefront, services, or legal requirements change. The effective date at the top of this page shows when the current version took effect.'] },
    ],
    contactHeading: 'Privacy questions?',
    contactBody: 'Email {{contactEmail}} or call {{contactPhone}}. We aim to acknowledge privacy requests within seven days and respond after verifying the request.',
  },
  terms: {
    eyebrow: 'Before you order',
    title: 'Terms of Service',
    intro: 'These terms describe how the Praba Leather Bali storefront, product enquiries, pouch, and WhatsApp ordering flow work.',
    updatedLabel: 'Effective from',
    updated: '10 August 2026',
    notice: 'By browsing this storefront or sending an enquiry, you agree to use it lawfully and to the terms that apply to the service you choose. A confirmed order may include additional written details from our team.',
    sections: [
      { heading: '1. About the storefront', paragraphs: ['Praba Leather Bali presents handcrafted leather goods made in Bali. The storefront provides product information, collection browsing, store details, and a pouch that prepares an enquiry for WhatsApp. It is not a self-service card-payment checkout.'] },
      { heading: '2. Product information', paragraphs: ['We describe materials, colours, sizes, images, prices, and availability as accurately as we can. Full-grain leather is a natural material, so grain, shade, marks, and patina can vary between pieces. Product photography and screen settings can also affect how a colour appears.', 'A product shown in the catalog is not reserved until our team confirms availability. We may correct a genuine pricing, stock, description, or image error before confirming an order.'] },
      { heading: '3. Pouch and WhatsApp orders', bullets: ['The pouch is a browser-based shortlist and may remain on your device until you clear it or remove its stored data.', 'The order message includes the items, variants, quantity, personalization, destination, and notes you provide.', 'Sending the message does not itself create a contract, charge your card, or guarantee stock.', 'Our team will confirm the final item, personalization, shipping cost, delivery estimate, and payment instructions directly with you.', 'You are responsible for checking your name, destination, variant, quantity, and personalization before sending the message.'] },
      { heading: '4. Prices, currency, and payment', paragraphs: ['Catalog prices are displayed in USD or IDR. The storefront IDR display uses a fixed presentation rate of IDR 15,700 per USD; the final amount and any payment or exchange fees will be confirmed by our team. Payment is arranged after availability and shipping are confirmed. We do not ask you to send card numbers or passwords through WhatsApp.'] },
      { heading: '5. Shipping and returns', paragraphs: ['Shipping availability, carrier, cost, duties, and delivery estimate depend on the destination and are confirmed individually. Please inspect a delivery promptly and contact {{contactEmail}} within 48 hours with photos if an item arrives damaged or incorrect.', 'For a return request, contact us within seven days of delivery before sending anything back. Items should be unused, unaltered, and returned with their original packaging. Custom embossing, commissioned work, worn items, and items damaged after delivery may not be eligible for return. We will confirm the applicable remedy, return address, and cost before you ship.'] },
      { heading: '6. Custom work and care', paragraphs: ['Custom initials, embossing, and commissioned pieces are made to your instructions. Please check spelling and placement before confirmation; approved personalization may not be reversible. Natural leather should be kept dry, stored away from direct heat, and cared for according to the care guidance supplied with the piece.'] },
      { heading: '7. Acceptable use', bullets: ['Do not interfere with the storefront, probe its systems, scrape content at a harmful rate, or upload malicious code.', 'Do not use our product images, brand assets, copy, or designs commercially without written permission.', 'Do not submit another person’s personal information or impersonate another customer.'] },
      { heading: '8. Content and availability', paragraphs: ['We may change, suspend, or discontinue a product, page, image, feature, or opening hour without prior notice. We aim to keep the site reliable, but the storefront is provided subject to availability and may contain interruptions or errors.'] },
      { heading: '9. Contact and governing context', paragraphs: ['Questions, complaints, and order issues should first be sent to {{contactEmail}}. These terms are intended to be read with the laws applicable to Praba Leather Bali’s operations in Indonesia and the mandatory consumer protections that apply to your purchase.'] },
    ],
    contactHeading: 'Need order help?',
    contactBody: 'Send your order reference or WhatsApp conversation to {{contactEmail}}. Our team will confirm the next step, shipping details, or return eligibility.',
  },
  cookies: {
    eyebrow: 'Small files, clear choices',
    title: 'Cookies & Browser Storage',
    intro: 'This notice records the storage technologies used by the current Praba Leather Bali storefront and explains how to clear them.',
    updatedLabel: 'Effective from',
    updated: '10 August 2026',
    notice: 'At the time of publication, the storefront does not use advertising cookies, analytics cookies, or a third-party tracking pixel. If that changes, this notice will be updated before the new category is enabled.',
    sections: [
      { heading: '1. What we use today', paragraphs: ['The public storefront currently uses browser localStorage and sessionStorage rather than non-essential cookies. These technologies keep the site useful across navigation and do not send the stored values to us by themselves.'] },
      { heading: '2. Local storage', bullets: ['leather-cart-storage — keeps products, variants, quantities, and optional embossing text in your pouch so it survives a page refresh. It remains until you remove the items, clear the pouch, or clear site storage.', 'praba-currency — remembers whether you selected USD or IDR. It remains until you change it or clear site storage.'] },
      { heading: '3. Session storage', bullets: ['praba:products, praba:heroes, praba:stores, and praba:looks — temporarily cache public catalog content so pages load faster. The live content is revalidated after approximately 60 seconds.', 'praba:content:en and praba:content:id — temporarily cache the published content for the selected language.'] },
      { heading: '4. What is not stored', paragraphs: ['We do not store payment card details in the storefront. The pouch is not an account and does not identify you until you choose to send the generated message to WhatsApp. We do not currently use cookies to follow you across other websites or to serve personalised advertising.'] },
      { heading: '5. Third-party destinations', paragraphs: ['If you follow a link to WhatsApp, Google Maps, Instagram, email, or telephone services, that service may set its own cookies or collect its own technical data. Their practices are outside this notice, so review the relevant provider’s policy before continuing.'] },
      { heading: '6. Your controls', paragraphs: ['You can remove localStorage and sessionStorage from your browser’s site settings, use the clear-pouch action for cart items, or block storage in your browser. Blocking storage may reset your pouch and currency preference and can make some storefront features less convenient.'] },
      { heading: '7. Future changes', paragraphs: ['If we add analytics, marketing, personalisation, or other non-essential storage, we will describe the provider, purpose, duration, and control available to you here and introduce any consent experience required by applicable law.'] },
    ],
    contactHeading: 'Questions about storage?',
    contactBody: 'Contact {{contactEmail}} if you want to understand or request deletion of information shared with Praba Leather Bali. Browser storage can be cleared directly from your device.',
  },
};

const id: Record<LegalSlug, LegalPolicy> = {
  privacy: {
    eyebrow: 'Informasi Anda',
    title: 'Kebijakan Privasi',
    intro: 'Kebijakan ini menjelaskan data yang dikumpulkan Praba Leather Bali, alasan penggunaannya, dan pilihan yang tersedia saat Anda menjelajahi koleksi atau menghubungi atelier.',
    updatedLabel: 'Berlaku sejak',
    updated: '10 Agustus 2026',
    notice: 'Kebijakan ini dibuat untuk storefront Praba Leather Bali saat ini. Isinya merupakan pemberitahuan informasi, bukan pengganti nasihat hukum untuk situasi tertentu.',
    sections: [
      { heading: '1. Tentang kami', paragraphs: ['Praba Leather Bali adalah studio barang kulit dan storefront online yang berbasis di Bali. Untuk pertanyaan atau permintaan privasi, hubungi {{contactEmail}} atau {{contactPhone}}.'] },
      { heading: '2. Informasi yang kami terima', paragraphs: ['Kami menerima informasi yang Anda pilih untuk bagikan saat menanyakan produk, membuat pouch, meminta personalisasi, atau melanjutkan pesanan melalui WhatsApp. Informasi ini dapat mencakup nama, wilayah atau negara pengiriman, nomor telepon, email, produk dan varian yang dipilih, teks emboss, serta pesan yang Anda kirim.', 'Layanan hosting, keamanan, dan konten kami juga dapat menerima informasi teknis seperti alamat IP, jenis browser, jenis perangkat, halaman rujukan, serta halaman atau aset yang diminta. Informasi ini digunakan agar storefront tetap tersedia dan aman.'] },
      { heading: '3. Cara kami menggunakan informasi', bullets: ['Menjawab pertanyaan produk, toko, personalisasi, dan pengiriman.', 'Menyiapkan ringkasan pesanan yang Anda pilih untuk dikirim ke chat WhatsApp bisnis kami.', 'Mengonfirmasi ketersediaan, harga, opsi pengiriman, dan pekerjaan custom.', 'Menjaga, memperbaiki, mengamankan, dan mengembangkan storefront serta kontennya.', 'Memenuhi kebutuhan akuntansi, pencegahan penipuan, hukum, dan penyelesaian sengketa jika berlaku.'] },
      { heading: '4. WhatsApp dan tautan lain', paragraphs: ['Saat memilih tombol pesanan atau kontak, Anda akan membuka percakapan WhatsApp dengan nomor yang tercantum di situs ini. Informasi dalam percakapan tersebut diproses oleh WhatsApp dan Praba Leather Bali untuk menjawab Anda serta memenuhi pertanyaan atau pesanan. WhatsApp memiliki ketentuan privasinya sendiri; tinjau terlebih dahulu sebelum mengirim informasi sensitif.', 'Storefront kami juga memiliki tautan ke Google Maps, Instagram, email, dan layanan telepon. Layanan tersebut berdiri sendiri dan dapat memproses informasi berdasarkan kebijakan masing-masing.'] },
      { heading: '5. Penyimpanan dan masa simpan', paragraphs: ['Isi pouch dan pilihan mata uang disimpan di browser Anda agar storefront dapat mengingatnya. Data tersebut tidak dikirim ke Praba Leather Bali sampai Anda memilih untuk membagikan pesanan atau pertanyaan. Pesan dan detail pesanan yang dibagikan kepada kami disimpan hanya selama diperlukan untuk menjawab, memenuhi, mendukung, mencocokkan, atau menyelesaikan urusan tersebut, atau untuk memenuhi kewajiban hukum.'] },
      { heading: '6. Pembagian dan pemrosesan internasional', paragraphs: ['Kami tidak menjual informasi pribadi Anda. Kami dapat membagikan informasi minimum yang diperlukan kepada penyedia layanan yang meng-hosting, mengamankan, menjalankan, atau mengirimkan bagian dari storefront, kepada mitra pengiriman setelah pesanan dikonfirmasi, atau ketika diwajibkan hukum. Sebagian penyedia dapat memproses informasi di luar Indonesia; kami berupaya menggunakan penyedia yang tepercaya dan membatasi data yang dibagikan.'] },
      { heading: '7. Pilihan dan hak Anda', paragraphs: ['Bergantung pada lokasi Anda dan hukum yang berlaku, Anda dapat meminta akses, koreksi, penghapusan, pembatasan, atau penghentian penggunaan informasi pribadi, serta menarik persetujuan jika pemrosesan didasarkan pada persetujuan. Anda juga dapat menanyakan cara kami menggunakan informasi atau menolak pemasaran langsung. Hubungi {{contactEmail}} dengan email atau nomor telepon yang digunakan dalam percakapan agar kami dapat memverifikasi permintaan dengan aman.'] },
      { heading: '8. Keamanan dan anak-anak', paragraphs: ['Kami menggunakan langkah administratif dan teknis yang wajar untuk melindungi informasi yang kami kendalikan, tetapi tidak ada transmisi atau penyimpanan internet yang dapat dijamin sepenuhnya aman. Storefront kami tidak ditujukan untuk anak di bawah 16 tahun dan kami tidak dengan sengaja meminta informasi pribadi mereka.'] },
      { heading: '9. Perubahan kebijakan', paragraphs: ['Kami dapat memperbarui halaman ini ketika storefront, layanan, atau kebutuhan hukum berubah. Tanggal berlaku di bagian atas menunjukkan kapan versi saat ini mulai berlaku.'] },
    ],
    contactHeading: 'Punya pertanyaan privasi?',
    contactBody: 'Email {{contactEmail}} atau telepon {{contactPhone}}. Kami berupaya mengakui permintaan privasi dalam tujuh hari dan merespons setelah permintaan diverifikasi.',
  },
  terms: {
    eyebrow: 'Sebelum memesan',
    title: 'Ketentuan Layanan',
    intro: 'Ketentuan ini menjelaskan cara kerja storefront Praba Leather Bali, pertanyaan produk, pouch, dan alur pemesanan melalui WhatsApp.',
    updatedLabel: 'Berlaku sejak',
    updated: '10 Agustus 2026',
    notice: 'Dengan menjelajahi storefront atau mengirim pertanyaan, Anda setuju menggunakannya secara sah dan mengikuti ketentuan layanan yang dipilih. Pesanan yang telah dikonfirmasi dapat memiliki detail tertulis tambahan dari tim kami.',
    sections: [
      { heading: '1. Tentang storefront', paragraphs: ['Praba Leather Bali menampilkan barang kulit buatan tangan di Bali. Storefront menyediakan informasi produk, penjelajahan koleksi, detail toko, dan pouch yang menyiapkan pertanyaan untuk WhatsApp. Storefront ini bukan checkout pembayaran kartu mandiri.'] },
      { heading: '2. Informasi produk', paragraphs: ['Kami menjelaskan bahan, warna, ukuran, gambar, harga, dan ketersediaan seakurat mungkin. Kulit full-grain adalah material alami, sehingga tekstur, warna, tanda alami, dan patina dapat berbeda antar-piece. Foto produk dan pengaturan layar juga dapat memengaruhi tampilan warna.', 'Produk yang tampil di katalog belum dipesan atau dicadangkan sampai tim kami mengonfirmasi ketersediaannya. Kami dapat memperbaiki kesalahan harga, stok, deskripsi, atau gambar yang nyata sebelum mengonfirmasi pesanan.'] },
      { heading: '3. Pouch dan pesanan WhatsApp', bullets: ['Pouch adalah daftar pilihan berbasis browser dan dapat tetap berada di perangkat Anda sampai dihapus atau data tersimpannya dibersihkan.', 'Pesan pesanan mencakup produk, varian, jumlah, personalisasi, tujuan, dan catatan yang Anda masukkan.', 'Mengirim pesan belum berarti kontrak, tagihan kartu, atau jaminan stok dibuat.', 'Tim kami akan mengonfirmasi item akhir, personalisasi, ongkos kirim, perkiraan waktu, dan instruksi pembayaran langsung kepada Anda.', 'Anda bertanggung jawab memeriksa nama, tujuan, varian, jumlah, dan personalisasi sebelum mengirim pesan.'] },
      { heading: '4. Harga, mata uang, dan pembayaran', paragraphs: ['Harga katalog ditampilkan dalam USD atau IDR. Tampilan IDR di storefront menggunakan kurs presentasi tetap IDR 15.700 per USD; jumlah akhir serta biaya pembayaran atau kurs akan dikonfirmasi oleh tim kami. Pembayaran diatur setelah ketersediaan dan pengiriman dikonfirmasi. Kami tidak meminta nomor kartu atau kata sandi melalui WhatsApp.'] },
      { heading: '5. Pengiriman dan pengembalian', paragraphs: ['Ketersediaan, kurir, ongkos, bea, dan perkiraan pengiriman bergantung pada tujuan dan dikonfirmasi secara individual. Periksa kiriman segera dan hubungi {{contactEmail}} dalam 48 jam dengan foto jika item rusak atau tidak sesuai.', 'Untuk permintaan pengembalian, hubungi kami dalam tujuh hari sejak barang diterima sebelum mengirimkannya kembali. Barang harus belum digunakan, belum diubah, dan dikembalikan dengan kemasan asli. Emboss custom, pekerjaan pesanan khusus, barang yang sudah digunakan, atau barang yang rusak setelah diterima dapat tidak memenuhi syarat pengembalian. Kami akan mengonfirmasi solusi, alamat pengembalian, dan biaya sebelum barang dikirim.'] },
      { heading: '6. Pekerjaan custom dan perawatan', paragraphs: ['Inisial, emboss, dan pesanan khusus dibuat sesuai instruksi Anda. Periksa ejaan dan penempatan sebelum konfirmasi; personalisasi yang telah disetujui mungkin tidak dapat dibalik. Kulit alami sebaiknya dijaga tetap kering, dijauhkan dari panas langsung, dan dirawat mengikuti panduan yang disertakan.'] },
      { heading: '7. Penggunaan yang diperbolehkan', bullets: ['Jangan mengganggu storefront, menyelidiki sistem, mengambil konten dengan laju yang membahayakan, atau mengunggah kode berbahaya.', 'Jangan menggunakan gambar produk, aset merek, tulisan, atau desain kami untuk keperluan komersial tanpa izin tertulis.', 'Jangan mengirim informasi pribadi orang lain atau menyamar sebagai pelanggan lain.'] },
      { heading: '8. Konten dan ketersediaan', paragraphs: ['Kami dapat mengubah, menangguhkan, atau menghentikan produk, halaman, gambar, fitur, atau jam buka tanpa pemberitahuan sebelumnya. Kami berusaha menjaga situs tetap andal, tetapi storefront disediakan sesuai ketersediaan dan dapat mengalami gangguan atau kesalahan.'] },
      { heading: '9. Kontak dan konteks hukum', paragraphs: ['Pertanyaan, keluhan, dan masalah pesanan sebaiknya terlebih dahulu dikirim ke {{contactEmail}}. Ketentuan ini dimaksudkan untuk dibaca bersama hukum yang berlaku pada operasional Praba Leather Bali di Indonesia dan perlindungan konsumen wajib yang berlaku pada pembelian Anda.'] },
    ],
    contactHeading: 'Butuh bantuan pesanan?',
    contactBody: 'Kirim referensi pesanan atau percakapan WhatsApp ke {{contactEmail}}. Tim kami akan mengonfirmasi langkah berikutnya, detail pengiriman, atau kelayakan pengembalian.',
  },
  cookies: {
    eyebrow: 'File kecil, pilihan jelas',
    title: 'Cookie & Penyimpanan Browser',
    intro: 'Pemberitahuan ini mencatat teknologi penyimpanan yang digunakan storefront Praba Leather Bali saat ini dan cara menghapusnya.',
    updatedLabel: 'Berlaku sejak',
    updated: '10 Agustus 2026',
    notice: 'Saat diterbitkan, storefront tidak menggunakan cookie iklan, cookie analitik, atau pixel pelacakan pihak ketiga. Jika berubah, pemberitahuan ini akan diperbarui sebelum kategori baru diaktifkan.',
    sections: [
      { heading: '1. Yang kami gunakan saat ini', paragraphs: ['Storefront publik saat ini menggunakan localStorage dan sessionStorage browser, bukan cookie non-esensial. Teknologi ini membuat situs tetap nyaman digunakan saat berpindah halaman dan tidak mengirimkan nilai tersimpan kepada kami dengan sendirinya.'] },
      { heading: '2. Local storage', bullets: ['leather-cart-storage — menyimpan produk, varian, jumlah, dan teks emboss opsional di pouch agar tetap ada setelah refresh. Data tersimpan sampai item dihapus, pouch dikosongkan, atau penyimpanan situs dibersihkan.', 'praba-currency — mengingat pilihan USD atau IDR. Data tersimpan sampai Anda menggantinya atau menghapus penyimpanan situs.'] },
      { heading: '3. Session storage', bullets: ['praba:products, praba:heroes, praba:stores, dan praba:looks — menyimpan sementara konten katalog publik agar halaman lebih cepat. Konten live divalidasi ulang setelah sekitar 60 detik.', 'praba:content:en dan praba:content:id — menyimpan sementara konten storefront yang dipublikasikan untuk bahasa yang dipilih.'] },
      { heading: '4. Yang tidak disimpan', paragraphs: ['Kami tidak menyimpan detail kartu pembayaran di storefront. Pouch bukan akun dan tidak mengidentifikasi Anda sampai Anda memilih mengirim pesan yang dibuat ke WhatsApp. Saat ini kami tidak menggunakan cookie untuk mengikuti Anda di situs lain atau menampilkan iklan yang dipersonalisasi.'] },
      { heading: '5. Tujuan pihak ketiga', paragraphs: ['Jika Anda mengikuti tautan ke WhatsApp, Google Maps, Instagram, email, atau layanan telepon, layanan tersebut dapat memasang cookie atau mengumpulkan data teknisnya sendiri. Praktik tersebut berada di luar pemberitahuan ini, jadi tinjau kebijakan penyedia yang relevan sebelum melanjutkan.'] },
      { heading: '6. Kendali Anda', paragraphs: ['Anda dapat menghapus localStorage dan sessionStorage melalui pengaturan situs di browser, menggunakan aksi kosongkan pouch untuk item keranjang, atau memblokir penyimpanan melalui browser. Memblokir penyimpanan dapat mengatur ulang pouch dan pilihan mata uang serta membuat beberapa fitur storefront kurang nyaman.'] },
      { heading: '7. Perubahan mendatang', paragraphs: ['Jika kami menambahkan penyimpanan analitik, pemasaran, personalisasi, atau penyimpanan non-esensial lainnya, kami akan menjelaskan penyedia, tujuan, durasi, dan kendali yang tersedia di sini serta menambahkan pengalaman persetujuan yang diwajibkan hukum yang berlaku.'] },
    ],
    contactHeading: 'Punya pertanyaan tentang penyimpanan?',
    contactBody: 'Hubungi {{contactEmail}} jika ingin memahami atau meminta penghapusan informasi yang telah dibagikan kepada Praba Leather Bali. Penyimpanan browser dapat dihapus langsung dari perangkat Anda.',
  },
};

export function getLegalPolicy(lang: Lang, slug: LegalSlug): LegalPolicy {
  return (lang === 'id' ? id : en)[slug];
}
