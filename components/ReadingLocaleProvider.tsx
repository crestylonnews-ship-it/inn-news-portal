'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_READING_LOCALE,
  READING_LANGUAGES,
  READING_REGIONS,
  readingLanguageFromBrowser,
  readingLanguageNativeName,
  primaryLanguageForTranslationTarget,
  readingLocaleFromCountry,
  type PanelLanguage,
  type ReadingLocale,
  type ReadingRegion,
} from '@/lib/reading-locale';
import type { ReadingLanguage } from '@/lib/local-translation';
import type { SiteLanguage } from '@/components/BilingualText';
import { supportsNativeTranslation } from '@/lib/native-translation';

const STORAGE_KEY = 'inn-reading-locale';
const OPEN_SETTINGS_EVENT = 'inn-reading-locale-settings';

type ReadingLocaleContextValue = {
  locale: ReadingLocale;
  configured: boolean;
  setLocale: (locale: ReadingLocale) => void;
  openSettings: () => void;
};

type DialogCopy = {
  title: string;
  description: string;
  automaticHint: string;
  manualHint: string;
  regionLabel: string;
  languageLabel: string;
  modelNotice: string;
  save: string;
  settingsNote: string;
};

type LayerCopy = {
  primaryTitle: string;
  primaryEnglish: string;
  primaryZh: string;
  primaryZhDescription: string;
  primaryEnDescription: string;
  targetTitle: string;
  targetEnglish: string;
  targetNote: string;
  regionTitle: string;
  regionEnglish: string;
  reset: string;
  externalTitle: string;
  externalEnglish: string;
};

const LAYER_COPY: Record<ReadingLanguage, LayerCopy> = {
  'zh-Hant': { primaryTitle: '主要閱讀語言', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: '中文為主，英文附屬', primaryEnDescription: '英文為主，中文附屬', targetTitle: '本機翻譯目標', targetEnglish: 'TRANSLATION TARGET', targetNote: '翻譯目標只決定本機 Translator API 的譯文；主要閱讀語言只決定中英內容的顯示順序。', regionTitle: '所在地區偏好', regionEnglish: 'REGION', reset: '恢復預設', externalTitle: '其他翻譯工具', externalEnglish: 'OTHER TOOLS' },
  en: { primaryTitle: 'Primary reading language', primaryEnglish: 'PRIMARY', primaryZh: 'Traditional Chinese', primaryZhDescription: 'Chinese first, English secondary', primaryEnDescription: 'English first, Chinese secondary', targetTitle: 'On-device translation target', targetEnglish: 'TRANSLATION TARGET', targetNote: 'The translation target controls on-device Translator API output only. The primary language controls the order of the existing Chinese and English layers.', regionTitle: 'Regional preference', regionEnglish: 'REGION', reset: 'Reset defaults', externalTitle: 'Other translation tools', externalEnglish: 'OTHER TOOLS' },
  ja: { primaryTitle: '主な閲覧言語', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: '中国語を主に、英語を補助表示', primaryEnDescription: '英語を主に、中国語を補助表示', targetTitle: '端末内翻訳の対象言語', targetEnglish: 'TRANSLATION TARGET', targetNote: '翻訳先は端末内 Translator API の出力だけを決めます。主な閲覧言語は既存の中国語・英語レイヤーの順番だけを決めます。', regionTitle: '地域の設定', regionEnglish: 'REGION', reset: '初期設定に戻す', externalTitle: 'その他の翻訳ツール', externalEnglish: 'OTHER TOOLS' },
  ko: { primaryTitle: '주요 읽기 언어', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: '중국어 우선, 영어 보조', primaryEnDescription: '영어 우선, 중국어 보조', targetTitle: '기기 내 번역 대상', targetEnglish: 'TRANSLATION TARGET', targetNote: '번역 대상은 기기 내 Translator API의 출력만 결정합니다. 주요 읽기 언어는 기존 중국어·영어 레이어의 순서만 결정합니다.', regionTitle: '지역 선호', regionEnglish: 'REGION', reset: '기본값으로 복원', externalTitle: '기타 번역 도구', externalEnglish: 'OTHER TOOLS' },
  th: { primaryTitle: 'ภาษาหลักสำหรับการอ่าน', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'จีนเป็นหลัก อังกฤษเป็นรอง', primaryEnDescription: 'อังกฤษเป็นหลัก จีนเป็นรอง', targetTitle: 'ภาษาเป้าหมายการแปลในอุปกรณ์', targetEnglish: 'TRANSLATION TARGET', targetNote: 'ภาษาเป้าหมายกำหนดเฉพาะผลลัพธ์ของ Translator API ในอุปกรณ์ ส่วนภาษาหลักกำหนดลำดับชั้นภาษาจีนและอังกฤษที่มีอยู่', regionTitle: 'การตั้งค่าภูมิภาค', regionEnglish: 'REGION', reset: 'คืนค่าเริ่มต้น', externalTitle: 'เครื่องมือแปลอื่น', externalEnglish: 'OTHER TOOLS' },
  vi: { primaryTitle: 'Ngôn ngữ đọc chính', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Ưu tiên tiếng Trung, kèm tiếng Anh', primaryEnDescription: 'Ưu tiên tiếng Anh, kèm tiếng Trung', targetTitle: 'Ngôn ngữ dịch trên thiết bị', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Ngôn ngữ đích chỉ quyết định đầu ra của Translator API trên thiết bị. Ngôn ngữ đọc chính chỉ quyết định thứ tự lớp tiếng Trung và tiếng Anh sẵn có.', regionTitle: 'Tùy chọn khu vực', regionEnglish: 'REGION', reset: 'Khôi phục mặc định', externalTitle: 'Công cụ dịch khác', externalEnglish: 'OTHER TOOLS' },
  id: { primaryTitle: 'Bahasa baca utama', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Bahasa Tionghoa utama, Inggris pelengkap', primaryEnDescription: 'Bahasa Inggris utama, Tionghoa pelengkap', targetTitle: 'Target terjemahan di perangkat', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Target terjemahan hanya menentukan keluaran Translator API di perangkat. Bahasa baca utama hanya menentukan urutan lapisan Tionghoa dan Inggris yang tersedia.', regionTitle: 'Preferensi wilayah', regionEnglish: 'REGION', reset: 'Pulihkan bawaan', externalTitle: 'Alat terjemahan lain', externalEnglish: 'OTHER TOOLS' },
  ms: { primaryTitle: 'Bahasa bacaan utama', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Bahasa Cina utama, Inggeris pelengkap', primaryEnDescription: 'Bahasa Inggeris utama, Cina pelengkap', targetTitle: 'Sasaran terjemahan pada peranti', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Sasaran terjemahan hanya menentukan output Translator API pada peranti. Bahasa bacaan utama hanya menentukan susunan lapisan Cina dan Inggeris sedia ada.', regionTitle: 'Keutamaan rantau', regionEnglish: 'REGION', reset: 'Pulihkan lalai', externalTitle: 'Alat terjemahan lain', externalEnglish: 'OTHER TOOLS' },
  ar: { primaryTitle: 'لغة القراءة الأساسية', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'الصينية أولاً والإنجليزية مرافقة', primaryEnDescription: 'الإنجليزية أولاً والصينية مرافقة', targetTitle: 'لغة الترجمة على الجهاز', targetEnglish: 'TRANSLATION TARGET', targetNote: 'تحدد لغة الهدف مخرجات Translator API على الجهاز فقط. تحدد لغة القراءة الأساسية ترتيب طبقتي الصينية والإنجليزية الموجودتين.', regionTitle: 'تفضيل المنطقة', regionEnglish: 'REGION', reset: 'استعادة الافتراضي', externalTitle: 'أدوات ترجمة أخرى', externalEnglish: 'OTHER TOOLS' },
  hi: { primaryTitle: 'मुख्य पठन भाषा', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'चीनी मुख्य, अंग्रेज़ी सहायक', primaryEnDescription: 'अंग्रेज़ी मुख्य, चीनी सहायक', targetTitle: 'डिवाइस पर अनुवाद लक्ष्य', targetEnglish: 'TRANSLATION TARGET', targetNote: 'अनुवाद लक्ष्य केवल डिवाइस पर Translator API आउटपुट तय करता है। मुख्य पठन भाषा केवल मौजूदा चीनी और अंग्रेज़ी परतों का क्रम तय करती है।', regionTitle: 'क्षेत्रीय प्राथमिकता', regionEnglish: 'REGION', reset: 'डिफ़ॉल्ट पुनर्स्थापित करें', externalTitle: 'अन्य अनुवाद उपकरण', externalEnglish: 'OTHER TOOLS' },
  bn: { primaryTitle: 'প্রধান পাঠের ভাষা', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'চীনা প্রধান, ইংরেজি সহায়ক', primaryEnDescription: 'ইংরেজি প্রধান, চীনা সহায়ক', targetTitle: 'ডিভাইসের অনুবাদ লক্ষ্য', targetEnglish: 'TRANSLATION TARGET', targetNote: 'অনুবাদ লক্ষ্য শুধু ডিভাইসের Translator API আউটপুট নির্ধারণ করে। প্রধান পাঠের ভাষা শুধু বিদ্যমান চীনা ও ইংরেজি স্তরের ক্রম নির্ধারণ করে।', regionTitle: 'অঞ্চল পছন্দ', regionEnglish: 'REGION', reset: 'ডিফল্ট পুনরুদ্ধার', externalTitle: 'অন্যান্য অনুবাদ সরঞ্জাম', externalEnglish: 'OTHER TOOLS' },
  fr: { primaryTitle: 'Langue principale de lecture', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Chinois principal, anglais secondaire', primaryEnDescription: 'Anglais principal, chinois secondaire', targetTitle: 'Cible de traduction sur l’appareil', targetEnglish: 'TRANSLATION TARGET', targetNote: 'La cible détermine uniquement la sortie du Translator API sur l’appareil. La langue principale détermine seulement l’ordre des couches chinoise et anglaise existantes.', regionTitle: 'Préférence régionale', regionEnglish: 'REGION', reset: 'Rétablir les valeurs par défaut', externalTitle: 'Autres outils de traduction', externalEnglish: 'OTHER TOOLS' },
  de: { primaryTitle: 'Primäre Lesesprache', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Chinesisch zuerst, Englisch ergänzend', primaryEnDescription: 'Englisch zuerst, Chinesisch ergänzend', targetTitle: 'Übersetzungsziel auf dem Gerät', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Das Übersetzungsziel bestimmt nur die Ausgabe der Translator API auf dem Gerät. Die primäre Lesesprache bestimmt nur die Reihenfolge der vorhandenen chinesischen und englischen Ebenen.', regionTitle: 'Regionale Präferenz', regionEnglish: 'REGION', reset: 'Standard wiederherstellen', externalTitle: 'Weitere Übersetzungstools', externalEnglish: 'OTHER TOOLS' },
  es: { primaryTitle: 'Idioma principal de lectura', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Chino principal, inglés secundario', primaryEnDescription: 'Inglés principal, chino secundario', targetTitle: 'Destino de traducción en el dispositivo', targetEnglish: 'TRANSLATION TARGET', targetNote: 'El destino solo controla la salida de Translator API en el dispositivo. El idioma principal solo controla el orden de las capas existentes en chino e inglés.', regionTitle: 'Preferencia regional', regionEnglish: 'REGION', reset: 'Restablecer valores predeterminados', externalTitle: 'Otras herramientas de traducción', externalEnglish: 'OTHER TOOLS' },
  pt: { primaryTitle: 'Idioma principal de leitura', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Chinês principal, inglês complementar', primaryEnDescription: 'Inglês principal, chinês complementar', targetTitle: 'Destino de tradução no dispositivo', targetEnglish: 'TRANSLATION TARGET', targetNote: 'O destino define apenas a saída do Translator API no dispositivo. O idioma principal define apenas a ordem das camadas existentes em chinês e inglês.', regionTitle: 'Preferência regional', regionEnglish: 'REGION', reset: 'Restaurar padrão', externalTitle: 'Outras ferramentas de tradução', externalEnglish: 'OTHER TOOLS' },
  ru: { primaryTitle: 'Основной язык чтения', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Китайский основной, английский дополнительный', primaryEnDescription: 'Английский основной, китайский дополнительный', targetTitle: 'Цель перевода на устройстве', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Цель перевода определяет только вывод Translator API на устройстве. Основной язык чтения определяет только порядок существующих китайского и английского слоёв.', regionTitle: 'Региональная настройка', regionEnglish: 'REGION', reset: 'Восстановить по умолчанию', externalTitle: 'Другие инструменты перевода', externalEnglish: 'OTHER TOOLS' },
  it: { primaryTitle: 'Lingua di lettura principale', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Cinese principale, inglese secondario', primaryEnDescription: 'Inglese principale, cinese secondario', targetTitle: 'Destinazione traduzione sul dispositivo', targetEnglish: 'TRANSLATION TARGET', targetNote: 'La destinazione controlla solo l’output di Translator API sul dispositivo. La lingua principale controlla solo l’ordine dei livelli cinese e inglese esistenti.', regionTitle: 'Preferenza regionale', regionEnglish: 'REGION', reset: 'Ripristina predefiniti', externalTitle: 'Altri strumenti di traduzione', externalEnglish: 'OTHER TOOLS' },
  nl: { primaryTitle: 'Primaire lees­taal', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Chinees voorop, Engels aanvullend', primaryEnDescription: 'Engels voorop, Chinees aanvullend', targetTitle: 'Vertaaldoel op apparaat', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Het vertaaldoel bepaalt alleen de uitvoer van Translator API op het apparaat. De primaire leestaal bepaalt alleen de volgorde van de bestaande Chinese en Engelse lagen.', regionTitle: 'Regionale voorkeur', regionEnglish: 'REGION', reset: 'Standaard herstellen', externalTitle: 'Andere vertaaltools', externalEnglish: 'OTHER TOOLS' },
  pl: { primaryTitle: 'Główny język czytania', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Chiński główny, angielski pomocniczy', primaryEnDescription: 'Angielski główny, chiński pomocniczy', targetTitle: 'Cel tłumaczenia na urządzeniu', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Cel określa tylko wynik Translator API na urządzeniu. Główny język czytania określa jedynie kolejność istniejących warstw chińskiej i angielskiej.', regionTitle: 'Preferencja regionalna', regionEnglish: 'REGION', reset: 'Przywróć domyślne', externalTitle: 'Inne narzędzia tłumaczenia', externalEnglish: 'OTHER TOOLS' },
  tr: { primaryTitle: 'Birincil okuma dili', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Çince birincil, İngilizce ikincil', primaryEnDescription: 'İngilizce birincil, Çince ikincil', targetTitle: 'Cihaz içi çeviri hedefi', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Çeviri hedefi yalnızca cihazdaki Translator API çıktısını belirler. Birincil okuma dili yalnızca mevcut Çince ve İngilizce katmanlarının sırasını belirler.', regionTitle: 'Bölge tercihi', regionEnglish: 'REGION', reset: 'Varsayılanları geri yükle', externalTitle: 'Diğer çeviri araçları', externalEnglish: 'OTHER TOOLS' },
  uk: { primaryTitle: 'Основна мова читання', primaryEnglish: 'PRIMARY', primaryZh: '繁體中文', primaryZhDescription: 'Китайська основна, англійська додаткова', primaryEnDescription: 'Англійська основна, китайська додаткова', targetTitle: 'Ціль перекладу на пристрої', targetEnglish: 'TRANSLATION TARGET', targetNote: 'Ціль перекладу визначає лише результат Translator API на пристрої. Основна мова читання визначає лише порядок наявних китайського та англійського шарів.', regionTitle: 'Регіональна перевага', regionEnglish: 'REGION', reset: 'Відновити стандартні', externalTitle: 'Інші інструменти перекладу', externalEnglish: 'OTHER TOOLS' },
};

const COPY: Record<ReadingLanguage, DialogCopy> = {
  'zh-Hant': {
    title: '先選擇你的所在地區與閱讀語言',
    description: '此設定只儲存在你的裝置。INN NEWS 不使用翻譯 API，也不會把文章文字傳送給翻譯服務。',
    automaticHint: '已依你的瀏覽器語言與所在地區預先建議；你可以立即更改。',
    manualHint: '無法確認你的所在地區，請自行選擇。',
    regionLabel: '所在地區', languageLabel: '優先閱讀語言',
    modelNotice: '模型僅在你開始翻譯時下載，首次可能需要數十 MB；完成後由同一瀏覽器快取重用。',
    save: '儲存設定並繼續', settingsNote: '你可隨時從導覽列的「閱讀語言」修改設定。',
  },
  en: {
    title: 'Choose your region and reading language',
    description: 'This setting stays on your device. INN NEWS does not use a translation API or send article text to a translation service.',
    automaticHint: 'A suggestion was prepared from your browser language and network region. You can change it now.',
    manualHint: 'Your network region could not be determined. Please choose manually.',
    regionLabel: 'Your region', languageLabel: 'Reading language',
    modelNotice: 'Models download only when you ask to translate. The first download may be tens of MB and is reused from this browser cache.',
    save: 'Save and continue', settingsNote: 'You can change this any time through “Reading language” in the navigation.',
  },
  ja: {
    title: '地域と言語を選択してください', description: 'この設定は端末内にのみ保存されます。INN NEWS は翻訳 API を使わず、記事本文を翻訳サービスに送信しません。',     automaticHint: 'ブラウザー言語とネットワークの地域に基づく候補を選択しました。今すぐ変更できます。', manualHint: 'ネットワークの地域を確認できませんでした。手動で選択してください。', regionLabel: 'お住まいの地域', languageLabel: '読む言語', modelNotice: 'モデルは翻訳を開始したときだけダウンロードされます。初回は数十 MB になる場合があり、このブラウザーのキャッシュで再利用されます。', save: '保存して続ける', settingsNote: 'ナビゲーションの「Reading language」からいつでも変更できます。',
  },
  ko: {
    title: '지역과 읽기 언어를 선택하세요', description: '이 설정은 기기에만 저장됩니다. INN NEWS는 번역 API를 사용하지 않으며 기사 본문을 번역 서비스로 보내지 않습니다.',     automaticHint: '브라우저 언어와 네트워크 지역을 바탕으로 추천을 준비했습니다. 지금 변경할 수 있습니다.', manualHint: '네트워크 지역을 확인할 수 없습니다. 직접 선택해 주세요.', regionLabel: '거주 지역', languageLabel: '읽기 언어', modelNotice: '번역을 시작할 때만 모델을 내려받습니다. 처음에는 수십 MB가 필요할 수 있으며 이 브라우저의 캐시에서 재사용됩니다.', save: '저장하고 계속하기', settingsNote: '탐색 메뉴의 “Reading language”에서 언제든 변경할 수 있습니다.',
  },
  th: {
    title: 'เลือกภูมิภาคและภาษาสำหรับการอ่าน', description: 'การตั้งค่านี้เก็บไว้ในอุปกรณ์ของคุณเท่านั้น INN NEWS ไม่ใช้ API แปลภาษา และไม่ส่งข้อความบทความไปยังบริการแปลภาษา', automaticHint: 'มีการแนะนำจากภูมิภาคเครือข่ายของคุณ และคุณเปลี่ยนได้ทันที', manualHint: 'ไม่สามารถระบุภูมิภาคเครือข่ายของคุณได้ โปรดเลือกด้วยตนเอง', regionLabel: 'ภูมิภาคของคุณ', languageLabel: 'ภาษาสำหรับการอ่าน', modelNotice: 'โมเดลจะดาวน์โหลดเมื่อคุณเริ่มแปลเท่านั้น ครั้งแรกอาจใช้หลายสิบ MB และใช้ซ้ำจากแคชของเบราว์เซอร์นี้ได้', save: 'บันทึกและดำเนินการต่อ', settingsNote: 'คุณเปลี่ยนได้ทุกเมื่อจาก “Reading language” ในเมนูนำทาง',
  },
  vi: {
    title: 'Chọn khu vực và ngôn ngữ đọc', description: 'Thiết lập này chỉ được lưu trên thiết bị của bạn. INN NEWS không dùng API dịch và không gửi nội dung bài viết đến dịch vụ dịch thuật.', automaticHint: 'Đề xuất đã được tạo theo khu vực mạng của bạn. Bạn có thể thay đổi ngay.', manualHint: 'Không thể xác định khu vực mạng của bạn. Vui lòng chọn thủ công.', regionLabel: 'Khu vực của bạn', languageLabel: 'Ngôn ngữ đọc', modelNotice: 'Mô hình chỉ tải xuống khi bạn yêu cầu dịch. Lần đầu có thể cần vài chục MB và sẽ được tái sử dụng từ bộ nhớ đệm của trình duyệt này.', save: 'Lưu và tiếp tục', settingsNote: 'Bạn có thể thay đổi bất cứ lúc nào từ “Reading language” trong thanh điều hướng.',
  },
  id: {
    title: 'Pilih wilayah dan bahasa baca', description: 'Pengaturan ini hanya disimpan di perangkat Anda. INN NEWS tidak menggunakan API terjemahan atau mengirim teks artikel ke layanan terjemahan.', automaticHint: 'Saran dibuat dari wilayah jaringan Anda. Anda dapat mengubahnya sekarang.', manualHint: 'Wilayah jaringan Anda tidak dapat ditentukan. Silakan pilih secara manual.', regionLabel: 'Wilayah Anda', languageLabel: 'Bahasa baca', modelNotice: 'Model hanya diunduh saat Anda meminta terjemahan. Unduhan pertama mungkin puluhan MB dan akan dipakai ulang dari cache browser ini.', save: 'Simpan dan lanjutkan', settingsNote: 'Anda dapat mengubahnya kapan saja melalui “Reading language” di navigasi.',
  },
  ms: {
    title: 'Pilih rantau dan bahasa bacaan', description: 'Tetapan ini hanya disimpan pada peranti anda. INN NEWS tidak menggunakan API terjemahan atau menghantar teks artikel kepada perkhidmatan terjemahan.', automaticHint: 'Cadangan dibuat berdasarkan rantau rangkaian anda. Anda boleh mengubahnya sekarang.', manualHint: 'Rantau rangkaian anda tidak dapat ditentukan. Sila pilih secara manual.', regionLabel: 'Rantau anda', languageLabel: 'Bahasa bacaan', modelNotice: 'Model hanya dimuat turun apabila anda meminta terjemahan. Muat turun pertama mungkin puluhan MB dan akan digunakan semula daripada cache pelayar ini.', save: 'Simpan dan teruskan', settingsNote: 'Anda boleh mengubahnya pada bila-bila masa melalui “Reading language” dalam navigasi.',
  },
  ar: {
    title: 'اختر منطقتك ولغة القراءة', description: 'يُحفظ هذا الإعداد على جهازك فقط. لا تستخدم INN NEWS واجهة برمجة ترجمة ولا ترسل نص المقال إلى خدمة ترجمة.', automaticHint: 'تم إعداد اقتراح بناءً على منطقة شبكتك، ويمكنك تغييره الآن.', manualHint: 'تعذر تحديد منطقة شبكتك. يرجى الاختيار يدويًا.', regionLabel: 'منطقتك', languageLabel: 'لغة القراءة', modelNotice: 'يُنزَّل النموذج فقط عند طلب الترجمة. قد يتطلب التنزيل الأول عشرات الميغابايت ويُعاد استخدامه من ذاكرة التخزين المؤقت لهذا المتصفح.', save: 'حفظ ومتابعة', settingsNote: 'يمكنك تغيير ذلك في أي وقت من “Reading language” في شريط التنقل.',
  },
  hi: {
    title: 'अपना क्षेत्र और पढ़ने की भाषा चुनें', description: 'यह सेटिंग केवल आपके डिवाइस पर रहती है। INN NEWS अनुवाद API का उपयोग नहीं करता और लेख का पाठ किसी अनुवाद सेवा को नहीं भेजता।', automaticHint: 'आपके नेटवर्क क्षेत्र के आधार पर सुझाव तैयार किया गया है। आप इसे अभी बदल सकते हैं।', manualHint: 'आपका नेटवर्क क्षेत्र निर्धारित नहीं किया जा सका। कृपया स्वयं चुनें।', regionLabel: 'आपका क्षेत्र', languageLabel: 'पढ़ने की भाषा', modelNotice: 'मॉडल केवल अनुवाद शुरू करने पर डाउनलोड होता है। पहला डाउनलोड कई दर्जन MB का हो सकता है और इस ब्राउज़र कैश से दोबारा उपयोग होगा।', save: 'सहेजें और जारी रखें', settingsNote: 'आप नेविगेशन में “Reading language” से इसे कभी भी बदल सकते हैं।',
  },
  bn: {
    title: 'আপনার অঞ্চল ও পড়ার ভাষা নির্বাচন করুন', description: 'এই সেটিং শুধু আপনার ডিভাইসে সংরক্ষিত থাকে। INN NEWS কোনো অনুবাদ API ব্যবহার করে না এবং নিবন্ধের লেখা অনুবাদ সেবায় পাঠায় না।', automaticHint: 'আপনার নেটওয়ার্ক অঞ্চলের ভিত্তিতে একটি পরামর্শ তৈরি করা হয়েছে। আপনি এখনই এটি বদলাতে পারেন।', manualHint: 'আপনার নেটওয়ার্ক অঞ্চল নির্ধারণ করা যায়নি। অনুগ্রহ করে নিজে নির্বাচন করুন।', regionLabel: 'আপনার অঞ্চল', languageLabel: 'পড়ার ভাষা', modelNotice: 'আপনি অনুবাদ চাইলে তবেই মডেল ডাউনলোড হয়। প্রথম ডাউনলোড কয়েক দশ MB হতে পারে এবং এই ব্রাউজারের ক্যাশে থেকে পুনর্ব্যবহৃত হবে।', save: 'সংরক্ষণ করে চালিয়ে যান', settingsNote: 'নেভিগেশনের “Reading language” থেকে যেকোনো সময় এটি বদলাতে পারবেন।',
  },
  fr: {
    title: 'Choisissez votre région et votre langue de lecture', description: 'Ce réglage reste uniquement sur votre appareil. INN NEWS n’utilise pas d’API de traduction et n’envoie pas le texte des articles à un service de traduction.', automaticHint: 'Une suggestion a été préparée selon votre région réseau. Vous pouvez la modifier maintenant.', manualHint: 'Votre région réseau n’a pas pu être déterminée. Veuillez choisir manuellement.', regionLabel: 'Votre région', languageLabel: 'Langue de lecture', modelNotice: 'Le modèle est téléchargé uniquement lorsque vous demandez une traduction. Le premier téléchargement peut faire plusieurs dizaines de Mo et sera réutilisé depuis le cache de ce navigateur.', save: 'Enregistrer et continuer', settingsNote: 'Vous pouvez modifier ce choix à tout moment via « Reading language » dans la navigation.',
  },
  de: {
    title: 'Wählen Sie Ihre Region und Lesesprache', description: 'Diese Einstellung bleibt nur auf Ihrem Gerät. INN NEWS verwendet keine Übersetzungs-API und sendet Artikeltext nicht an einen Übersetzungsdienst.', automaticHint: 'Ein Vorschlag wurde anhand Ihrer Netzwerkregion vorbereitet. Sie können ihn jetzt ändern.', manualHint: 'Ihre Netzwerkregion konnte nicht ermittelt werden. Bitte wählen Sie manuell.', regionLabel: 'Ihre Region', languageLabel: 'Lesesprache', modelNotice: 'Das Modell wird nur heruntergeladen, wenn Sie eine Übersetzung anfordern. Der erste Download kann mehrere zehn MB umfassen und wird aus diesem Browser-Cache wiederverwendet.', save: 'Speichern und fortfahren', settingsNote: 'Sie können dies jederzeit über „Reading language“ in der Navigation ändern.',
  },
  es: {
    title: 'Elige tu región y el idioma de lectura', description: 'Esta configuración se guarda solo en tu dispositivo. INN NEWS no utiliza una API de traducción ni envía el texto de los artículos a un servicio de traducción.', automaticHint: 'Se preparó una sugerencia según tu región de red. Puedes cambiarla ahora.', manualHint: 'No se pudo determinar tu región de red. Selecciona manualmente.', regionLabel: 'Tu región', languageLabel: 'Idioma de lectura', modelNotice: 'El modelo se descarga solo al solicitar una traducción. La primera descarga puede requerir decenas de MB y se reutiliza desde la caché de este navegador.', save: 'Guardar y continuar', settingsNote: 'Puedes cambiarlo en cualquier momento desde “Reading language” en la navegación.',
  },
  pt: {
    title: 'Escolha sua região e idioma de leitura', description: 'Esta configuração fica apenas no seu dispositivo. A INN NEWS não usa API de tradução nem envia o texto do artigo a um serviço de tradução.', automaticHint: 'Uma sugestão foi preparada a partir da sua região de rede. Você pode alterá-la agora.', manualHint: 'Não foi possível determinar sua região de rede. Escolha manualmente.', regionLabel: 'Sua região', languageLabel: 'Idioma de leitura', modelNotice: 'O modelo só é baixado quando você solicita uma tradução. O primeiro download pode ter dezenas de MB e será reutilizado do cache deste navegador.', save: 'Salvar e continuar', settingsNote: 'Você pode alterar isso a qualquer momento em “Reading language” na navegação.',
  },
  ru: {
    title: 'Выберите регион и язык чтения', description: 'Эта настройка хранится только на вашем устройстве. INN NEWS не использует API перевода и не отправляет текст статьи в службу перевода.', automaticHint: 'Подготовлена рекомендация на основе вашего сетевого региона. Её можно изменить сейчас.', manualHint: 'Не удалось определить ваш сетевой регион. Выберите вручную.', regionLabel: 'Ваш регион', languageLabel: 'Язык чтения', modelNotice: 'Модель загружается только при запросе перевода. Первая загрузка может составить десятки МБ и будет повторно использоваться из кэша этого браузера.', save: 'Сохранить и продолжить', settingsNote: 'Вы можете изменить это в любое время через «Reading language» в навигации.',
  },
  it: {
    title: 'Scegli la regione e la lingua di lettura', description: 'Questa impostazione resta solo sul tuo dispositivo. INN NEWS non usa API di traduzione e non invia il testo degli articoli a un servizio di traduzione.', automaticHint: 'È stato preparato un suggerimento in base alla tua regione di rete. Puoi modificarlo ora.', manualHint: 'Non è stato possibile determinare la tua regione di rete. Scegli manualmente.', regionLabel: 'La tua regione', languageLabel: 'Lingua di lettura', modelNotice: 'Il modello viene scaricato solo quando richiedi una traduzione. Il primo download può richiedere decine di MB e verrà riutilizzato dalla cache di questo browser.', save: 'Salva e continua', settingsNote: 'Puoi modificarlo in qualsiasi momento da “Reading language” nella navigazione.',
  },
  nl: {
    title: 'Kies uw regio en leestaal', description: 'Deze instelling blijft alleen op uw apparaat. INN NEWS gebruikt geen vertaal-API en stuurt artikeltekst niet naar een vertaaldienst.', automaticHint: 'Er is een voorstel gemaakt op basis van uw netwerkregio. U kunt dit nu wijzigen.', manualHint: 'Uw netwerkregio kon niet worden vastgesteld. Kies handmatig.', regionLabel: 'Uw regio', languageLabel: 'Leestaal', modelNotice: 'Het model wordt alleen gedownload wanneer u om vertaling vraagt. De eerste download kan tientallen MB groot zijn en wordt hergebruikt vanuit de cache van deze browser.', save: 'Opslaan en doorgaan', settingsNote: 'U kunt dit altijd wijzigen via “Reading language” in de navigatie.',
  },
  pl: {
    title: 'Wybierz region i język czytania', description: 'To ustawienie pozostaje tylko na Twoim urządzeniu. INN NEWS nie używa API tłumaczenia i nie wysyła tekstu artykułu do usługi tłumaczeniowej.', automaticHint: 'Przygotowano sugestię na podstawie regionu sieci. Możesz ją teraz zmienić.', manualHint: 'Nie udało się określić regionu sieci. Wybierz ręcznie.', regionLabel: 'Twój region', languageLabel: 'Język czytania', modelNotice: 'Model jest pobierany tylko po żądaniu tłumaczenia. Pierwsze pobranie może mieć kilkadziesiąt MB i będzie ponownie używane z pamięci podręcznej tej przeglądarki.', save: 'Zapisz i kontynuuj', settingsNote: 'Możesz to zmienić w każdej chwili przez „Reading language” w nawigacji.',
  },
  tr: {
    title: 'Bölgenizi ve okuma dilinizi seçin', description: 'Bu ayar yalnızca cihazınızda saklanır. INN NEWS çeviri API’si kullanmaz ve makale metnini bir çeviri hizmetine göndermez.', automaticHint: 'Ağ bölgenize göre bir öneri hazırlandı. Şimdi değiştirebilirsiniz.', manualHint: 'Ağ bölgeniz belirlenemedi. Lütfen elle seçin.', regionLabel: 'Bölgeniz', languageLabel: 'Okuma dili', modelNotice: 'Model yalnızca çeviri istediğinizde indirilir. İlk indirme onlarca MB olabilir ve bu tarayıcının önbelleğinden yeniden kullanılır.', save: 'Kaydet ve devam et', settingsNote: 'Bunu gezinmedeki “Reading language” üzerinden istediğiniz zaman değiştirebilirsiniz.',
  },
  uk: {
    title: 'Оберіть регіон і мову читання', description: 'Це налаштування зберігається лише на вашому пристрої. INN NEWS не використовує API перекладу та не надсилає текст статті до служби перекладу.', automaticHint: 'Підготовлено пропозицію на основі вашого мережевого регіону. Її можна змінити зараз.', manualHint: 'Не вдалося визначити ваш мережевий регіон. Виберіть вручну.', regionLabel: 'Ваш регіон', languageLabel: 'Мова читання', modelNotice: 'Модель завантажується лише коли ви запитуєте переклад. Перше завантаження може становити десятки МБ і повторно використовуватиметься з кешу цього браузера.', save: 'Зберегти й продовжити', settingsNote: 'Ви можете змінити це будь-коли через «Reading language» у навігації.',
  },
};

const FALLBACK_COPY = COPY['zh-Hant'];
const ENGLISH_COPY = COPY.en;

type ExternalToolCopy = {
  title: string;
  description: string;
  browser: string;
  chrome: string;
  tencent: string;
  privacy: string;
};

/** These links are offers only. They never install software or transmit article text automatically. */
const EXTERNAL_TOOL_COPY: Record<ReadingLanguage, ExternalToolCopy> = {
  'zh-Hant': { title: '需要時使用外部翻譯工具', description: '請自行選擇要開啟的官方工具；點選後才會在新分頁離開本站。', browser: '開啟 Google 翻譯網頁', chrome: '前往 Chrome 的官方翻譯選項', tencent: '開啟騰訊翻譯君官方頁面', privacy: '外部服務依其自身隱私政策處理內容；INN NEWS 不會自動傳送文章。' },
  en: { title: 'Use an external translator when needed', description: 'Choose an official tool yourself. It opens in a new tab only after you click it.', browser: 'Open Google Translate', chrome: 'View Chrome’s official translation option', tencent: 'Open official Tencent Translator', privacy: 'External services apply their own privacy policies. INN NEWS never sends article text automatically.' },
  ja: { title: '必要に応じて外部翻訳ツールを使用', description: '公式ツールを自分で選択してください。クリックしたときだけ新しいタブで開きます。', browser: 'Google 翻訳を開く', chrome: 'Chrome の公式翻訳オプションを表示', tencent: '公式 Tencent Translator を開く', privacy: '外部サービスには各社のプライバシーポリシーが適用されます。INN NEWS が記事を自動送信することはありません。' },
  ko: { title: '필요할 때 외부 번역 도구 사용', description: '공식 도구를 직접 선택하세요. 클릭한 경우에만 새 탭에서 열립니다.', browser: 'Google 번역 열기', chrome: 'Chrome 공식 번역 옵션 보기', tencent: '공식 Tencent Translator 열기', privacy: '외부 서비스에는 각 서비스의 개인정보처리방침이 적용됩니다. INN NEWS는 기사 텍스트를 자동 전송하지 않습니다.' },
  th: { title: 'ใช้เครื่องมือแปลภายนอกเมื่อจำเป็น', description: 'เลือกใช้เครื่องมือทางการด้วยตนเอง ระบบจะเปิดแท็บใหม่เมื่อคุณกดเท่านั้น', browser: 'เปิด Google แปลภาษา', chrome: 'ดูตัวเลือกการแปลทางการของ Chrome', tencent: 'เปิด Tencent Translator อย่างเป็นทางการ', privacy: 'บริการภายนอกใช้นโยบายความเป็นส่วนตัวของตนเอง INN NEWS จะไม่ส่งเนื้อหาบทความโดยอัตโนมัติ' },
  vi: { title: 'Dùng công cụ dịch bên ngoài khi cần', description: 'Hãy tự chọn công cụ chính thức. Công cụ chỉ mở ở thẻ mới sau khi bạn nhấn.', browser: 'Mở Google Dịch', chrome: 'Xem tuỳ chọn dịch chính thức của Chrome', tencent: 'Mở Tencent Translator chính thức', privacy: 'Dịch vụ bên ngoài áp dụng chính sách riêng. INN NEWS không tự động gửi nội dung bài viết.' },
  id: { title: 'Gunakan alat terjemahan eksternal bila perlu', description: 'Pilih sendiri alat resminya. Alat hanya dibuka di tab baru setelah Anda mengeklik.', browser: 'Buka Google Translate', chrome: 'Lihat opsi terjemahan resmi Chrome', tencent: 'Buka Tencent Translator resmi', privacy: 'Layanan eksternal memakai kebijakannya sendiri. INN NEWS tidak mengirim teks artikel secara otomatis.' },
  ms: { title: 'Gunakan alat terjemahan luaran apabila perlu', description: 'Pilih sendiri alat rasmi. Ia hanya dibuka dalam tab baharu selepas anda mengklik.', browser: 'Buka Google Translate', chrome: 'Lihat pilihan terjemahan rasmi Chrome', tencent: 'Buka Tencent Translator rasmi', privacy: 'Perkhidmatan luaran menggunakan dasar mereka sendiri. INN NEWS tidak menghantar teks artikel secara automatik.' },
  ar: { title: 'استخدم أداة ترجمة خارجية عند الحاجة', description: 'اختر الأداة الرسمية بنفسك؛ ولا تُفتح في علامة تبويب جديدة إلا بعد النقر.', browser: 'فتح Google Translate', chrome: 'عرض خيار الترجمة الرسمي في Chrome', tencent: 'فتح Tencent Translator الرسمي', privacy: 'تطبّق الخدمات الخارجية سياساتها الخاصة. لا ترسل INN NEWS نص المقال تلقائيًا.' },
  hi: { title: 'ज़रूरत होने पर बाहरी अनुवाद उपकरण इस्तेमाल करें', description: 'आधिकारिक उपकरण स्वयं चुनें। यह आपके क्लिक करने पर ही नए टैब में खुलेगा।', browser: 'Google Translate खोलें', chrome: 'Chrome का आधिकारिक अनुवाद विकल्प देखें', tencent: 'आधिकारिक Tencent Translator खोलें', privacy: 'बाहरी सेवाओं की अपनी गोपनीयता नीतियाँ लागू होती हैं। INN NEWS लेख का पाठ अपने आप नहीं भेजता।' },
  bn: { title: 'প্রয়োজনে বাহ্যিক অনুবাদ টুল ব্যবহার করুন', description: 'নিজে অফিসিয়াল টুলটি বেছে নিন। ক্লিক করলেই শুধু নতুন ট্যাবে খুলবে।', browser: 'Google Translate খুলুন', chrome: 'Chrome-এর অফিসিয়াল অনুবাদ বিকল্প দেখুন', tencent: 'অফিসিয়াল Tencent Translator খুলুন', privacy: 'বাহ্যিক সেবার নিজস্ব গোপনীয়তা নীতি প্রযোজ্য। INN NEWS স্বয়ংক্রিয়ভাবে নিবন্ধ পাঠায় না।' },
  fr: { title: 'Utiliser un traducteur externe si nécessaire', description: 'Choisissez vous-même un outil officiel. Il ne s’ouvre dans un nouvel onglet qu’après votre clic.', browser: 'Ouvrir Google Traduction', chrome: 'Voir l’option de traduction officielle de Chrome', tencent: 'Ouvrir Tencent Translator officiel', privacy: 'Les services externes appliquent leurs propres règles de confidentialité. INN NEWS n’envoie jamais automatiquement le texte des articles.' },
  de: { title: 'Bei Bedarf einen externen Übersetzer nutzen', description: 'Wählen Sie ein offizielles Werkzeug selbst. Es öffnet sich erst nach Ihrem Klick in einem neuen Tab.', browser: 'Google Übersetzer öffnen', chrome: 'Offizielle Übersetzungsoption von Chrome anzeigen', tencent: 'Offiziellen Tencent Translator öffnen', privacy: 'Für externe Dienste gelten deren eigene Datenschutzrichtlinien. INN NEWS überträgt Artikeltexte niemals automatisch.' },
  es: { title: 'Usar un traductor externo cuando sea necesario', description: 'Elige tú mismo una herramienta oficial. Solo se abre en una pestaña nueva después de hacer clic.', browser: 'Abrir Google Traductor', chrome: 'Ver la opción oficial de traducción de Chrome', tencent: 'Abrir Tencent Translator oficial', privacy: 'Los servicios externos aplican sus propias políticas de privacidad. INN NEWS nunca envía texto de artículos automáticamente.' },
  pt: { title: 'Use um tradutor externo quando necessário', description: 'Escolha você mesmo uma ferramenta oficial. Ela abre em uma nova aba somente após o seu clique.', browser: 'Abrir Google Tradutor', chrome: 'Ver a opção oficial de tradução do Chrome', tencent: 'Abrir Tencent Translator oficial', privacy: 'Serviços externos aplicam suas próprias políticas de privacidade. A INN NEWS nunca envia texto de artigos automaticamente.' },
  ru: { title: 'При необходимости используйте внешний переводчик', description: 'Выберите официальный инструмент самостоятельно. Он откроется в новой вкладке только после нажатия.', browser: 'Открыть Google Переводчик', chrome: 'Посмотреть официальную функцию перевода Chrome', tencent: 'Открыть официальный Tencent Translator', privacy: 'Внешние сервисы применяют собственные политики конфиденциальности. INN NEWS не отправляет текст статей автоматически.' },
  it: { title: 'Usa un traduttore esterno quando necessario', description: 'Scegli tu uno strumento ufficiale. Si aprirà in una nuova scheda solo dopo il clic.', browser: 'Apri Google Traduttore', chrome: 'Vedi l’opzione di traduzione ufficiale di Chrome', tencent: 'Apri Tencent Translator ufficiale', privacy: 'I servizi esterni applicano le proprie politiche sulla privacy. INN NEWS non invia mai automaticamente il testo degli articoli.' },
  nl: { title: 'Gebruik indien nodig een externe vertaler', description: 'Kies zelf een officiële tool. Deze opent pas na uw klik in een nieuw tabblad.', browser: 'Google Translate openen', chrome: 'Officiële vertaaloptie van Chrome bekijken', tencent: 'Officiële Tencent Translator openen', privacy: 'Voor externe diensten gelden hun eigen privacyregels. INN NEWS verstuurt artikeltekst nooit automatisch.' },
  pl: { title: 'W razie potrzeby użyj zewnętrznego tłumacza', description: 'Samodzielnie wybierz oficjalne narzędzie. Otworzy się ono w nowej karcie dopiero po kliknięciu.', browser: 'Otwórz Tłumacza Google', chrome: 'Zobacz oficjalną opcję tłumaczenia Chrome', tencent: 'Otwórz oficjalny Tencent Translator', privacy: 'Usługi zewnętrzne stosują własne zasady prywatności. INN NEWS nigdy nie wysyła tekstu artykułu automatycznie.' },
  tr: { title: 'Gerektiğinde harici çeviri aracı kullanın', description: 'Resmî aracı kendiniz seçin. Yalnızca tıkladıktan sonra yeni sekmede açılır.', browser: 'Google Çeviri’yi aç', chrome: 'Chrome’un resmî çeviri seçeneğini görüntüle', tencent: 'Resmî Tencent Translator’ı aç', privacy: 'Harici hizmetler kendi gizlilik politikalarını uygular. INN NEWS makale metnini otomatik olarak göndermez.' },
  uk: { title: 'За потреби скористайтеся зовнішнім перекладачем', description: 'Самостійно виберіть офіційний інструмент. Він відкриється в новій вкладці лише після натискання.', browser: 'Відкрити Google Перекладач', chrome: 'Переглянути офіційну функцію перекладу Chrome', tencent: 'Відкрити офіційний Tencent Translator', privacy: 'Зовнішні служби застосовують власні політики конфіденційності. INN NEWS ніколи не надсилає текст статей автоматично.' },
};

const GOOGLE_LANGUAGE_CODES: Partial<Record<ReadingLanguage, string>> = { 'zh-Hant': 'zh-TW' };
const CHROME_BROWSER_DOWNLOAD = 'https://www.google.com/chrome/';
const GOOGLE_TRANSLATE_WEB = 'https://translate.google.com/';

function ExternalTranslatorOptions({ language, panelLanguage }: { language: ReadingLanguage; panelLanguage: PanelLanguage }) {
  const localized: ReadingLanguage = panelLanguage === 'bilingual' ? 'zh-Hant' : panelLanguage;
  const copy = EXTERNAL_TOOL_COPY[localized as ReadingLanguage] ?? EXTERNAL_TOOL_COPY.en;
  const fallback = panelLanguage === 'bilingual' ? EXTERNAL_TOOL_COPY.en : null;
  const targetLanguage = GOOGLE_LANGUAGE_CODES[language] ?? language;
  const googleUrl = `${GOOGLE_TRANSLATE_WEB}?sl=auto&tl=${encodeURIComponent(targetLanguage)}&op=translate`;
  const chromeNativeSupported = supportsNativeTranslation();
  const links = [
    {
      key: 'chrome-native',
      href: CHROME_BROWSER_DOWNLOAD,
      name: 'Chrome built-in Translator',
      label: chromeNativeSupported
        ? '此瀏覽器已偵測到原生本機翻譯 · Native on-device translation is available in this browser'
        : '建議使用最新版桌面 Chrome，以取得本機翻譯功能 · Recommended: latest desktop Chrome',
      fallbackLabel: chromeNativeSupported
        ? 'Native on-device translation is available in this browser'
        : 'Recommended: latest desktop Chrome for on-device translation',
      recommended: true,
    },
    { key: 'google', href: googleUrl, name: 'Google Translate', label: copy.browser, fallbackLabel: fallback?.browser, recommended: false },
  ];

  return (
    <section className="reading-locale-external-tools" aria-label={copy.title}>
      <h3>{copy.title}{fallback && <span className="reading-locale-english">{fallback.title}</span>}</h3>
      <p>{copy.description}{fallback && <span className="reading-locale-english">{fallback.description}</span>}</p>
      <div className="reading-locale-tool-grid">
        {links.map(link => (
          <a key={link.key} className={`reading-locale-tool-link${link.recommended ? ' is-recommended' : ''}`} href={link.href} target="_blank" rel="noopener noreferrer">
            <strong>{link.name}{link.recommended && <em>RECOMMENDED</em>}</strong>
            <span>{link.label}{fallback && link.fallbackLabel && <span className="reading-locale-english">{link.fallbackLabel}</span>}</span>
          </a>
        ))}
      </div>
      <p className="reading-locale-external-note">{copy.privacy}{fallback && <span className="reading-locale-english">{fallback.privacy}</span>}</p>
    </section>
  );
}

const ReadingLocaleContext = createContext<ReadingLocaleContextValue | null>(null);

function isReadingLanguage(value: unknown): value is ReadingLanguage {
  return typeof value === 'string' && READING_LANGUAGES.some(language => language.code === value);
}

function isReadingRegion(value: unknown): value is ReadingRegion {
  return typeof value === 'string' && READING_REGIONS.some(region => region.code === value);
}

function readStoredLocale(): ReadingLocale | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ReadingLocale> & { language?: unknown };
    if (!isReadingRegion(value.region)) return null;

    if (isReadingLanguage(value.translationTarget) && (value.primaryLanguage === 'zh' || value.primaryLanguage === 'en')) {
      return {
        region: value.region,
        primaryLanguage: value.primaryLanguage,
        translationTarget: value.translationTarget,
      };
    }

    // Migrate the previously shipped `{ region, language }` format without
    // discarding a visitor's chosen translation target.
    if (isReadingLanguage(value.language)) {
      return {
        region: value.region,
        primaryLanguage: primaryLanguageForTranslationTarget(value.language),
        translationTarget: value.language,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/** Reads only the loc= country code from Cloudflare's same-origin trace endpoint; the IP itself is discarded. */
async function readCloudflareCountryCode(): Promise<string | null> {
  const response = await fetch('/cdn-cgi/trace', { cache: 'no-store' });
  if (!response.ok) return null;
  const trace = await response.text();
  return trace.match(/^loc=([A-Z]{2})$/m)?.[1] || null;
}

function DialogText({
  language,
  localized,
  fallback,
}: {
  language: PanelLanguage;
  localized: (copy: DialogCopy) => string;
  fallback: (copy: DialogCopy) => string;
}) {
  if (language === 'bilingual') {
    return <><span lang="zh-Hant">{fallback(FALLBACK_COPY)}</span><span className="reading-locale-english" lang="en">{fallback(ENGLISH_COPY)}</span></>;
  }
  return <>{localized(COPY[language])}</>;
}

function LocaleDialog({
  initialLocale,
  panelLanguage,
  detected,
  forced,
  onSave,
  onClose,
}: {
  initialLocale: ReadingLocale;
  panelLanguage: PanelLanguage;
  detected: boolean;
  forced: boolean;
  onSave: (locale: ReadingLocale) => void;
  onClose: () => void;
}) {
  const [region, setRegion] = useState<ReadingRegion>(initialLocale.region);
  const [primaryLanguage, setPrimaryLanguage] = useState<SiteLanguage>(initialLocale.primaryLanguage);
  const [translationTarget, setTranslationTarget] = useState<ReadingLanguage>(initialLocale.translationTarget);
  const interfaceLanguage: ReadingLanguage = panelLanguage === 'bilingual' ? 'zh-Hant' : panelLanguage;
  const layerCopy = LAYER_COPY[interfaceLanguage] || LAYER_COPY.en;

  useEffect(() => {
    setRegion(initialLocale.region);
    setPrimaryLanguage(initialLocale.primaryLanguage);
    setTranslationTarget(initialLocale.translationTarget);
  }, [initialLocale]);

  const text = (selector: (copy: DialogCopy) => string) => (
    <DialogText language={panelLanguage} localized={selector} fallback={selector} />
  );

  return (
    <div className="reading-locale-overlay" role="presentation">
      <section className="reading-locale-dialog reading-locale-dialog--layers" role="dialog" aria-modal="true" aria-labelledby="reading-locale-title">
        <div className="reading-locale-dialog-head">
          <span className="reading-locale-kicker">// LANGUAGE LAYERS</span>
          {!forced ? (
            <div className="reading-locale-dialog-actions">
              <button type="button" className="reading-locale-reset" onClick={() => {
                setRegion(DEFAULT_READING_LOCALE.region);
                setPrimaryLanguage(DEFAULT_READING_LOCALE.primaryLanguage);
                setTranslationTarget(DEFAULT_READING_LOCALE.translationTarget);
              }}>{layerCopy.reset}</button>
              <button type="button" className="reading-locale-close" onClick={onClose} aria-label="Close reading-language settings">×</button>
            </div>
          ) : (
            <button type="button" className="reading-locale-reset" onClick={() => {
              setRegion(DEFAULT_READING_LOCALE.region);
              setPrimaryLanguage(DEFAULT_READING_LOCALE.primaryLanguage);
              setTranslationTarget(DEFAULT_READING_LOCALE.translationTarget);
            }}>{layerCopy.reset}</button>
          )}
        </div>
        <h2 id="reading-locale-title" className="sr-only">{text(copy => copy.title)}</h2>
        <p className="reading-locale-detection" aria-live="polite">
          {text(copy => detected ? copy.automaticHint : copy.manualHint)}
        </p>

        <section className="reading-locale-layer-section" aria-labelledby="primary-reading-language">
          <div className="reading-locale-layer-heading">
            <h3 id="primary-reading-language">{layerCopy.primaryTitle}</h3><span>{layerCopy.primaryEnglish}</span>
          </div>
          <div className="reading-locale-primary-grid">
            <button type="button" className={`reading-locale-primary-card${primaryLanguage === 'zh' ? ' is-selected' : ''}`} onClick={() => setPrimaryLanguage('zh')} aria-pressed={primaryLanguage === 'zh'}>
              <strong>{layerCopy.primaryZh}</strong><span>{layerCopy.primaryZhDescription}</span>
            </button>
            <button type="button" className={`reading-locale-primary-card${primaryLanguage === 'en' ? ' is-selected' : ''}`} onClick={() => setPrimaryLanguage('en')} aria-pressed={primaryLanguage === 'en'}>
              <strong>English</strong><span>{layerCopy.primaryEnDescription}</span>
            </button>
          </div>
        </section>

        <section className="reading-locale-layer-section" aria-labelledby="translation-target-language">
          <div className="reading-locale-layer-heading">
            <h3 id="translation-target-language">{layerCopy.targetTitle}</h3><span>{layerCopy.targetEnglish}</span>
          </div>
          <div className="reading-locale-target-grid">
            {READING_LANGUAGES.map(item => (
              <button key={item.code} type="button" className={`reading-locale-target-card${translationTarget === item.code ? ' is-selected' : ''}`} onClick={() => setTranslationTarget(item.code)} aria-pressed={translationTarget === item.code}>
                <strong>{item.native}</strong><span>{item.en}</span>
              </button>
            ))}
          </div>
          <p className="reading-locale-layer-note">{layerCopy.targetNote}</p>
        </section>

        <details className="reading-locale-details">
          <summary>{layerCopy.regionTitle}<span>{layerCopy.regionEnglish}</span></summary>
          <label className="reading-locale-field">
            <select value={region} onChange={event => setRegion(event.target.value as ReadingRegion)}>
              {READING_REGIONS.map(item => <option key={item.code} value={item.code}>{item.en} · {item.zh}</option>)}
            </select>
          </label>
        </details>

        <details className="reading-locale-details">
          <summary>{layerCopy.externalTitle}<span>{layerCopy.externalEnglish}</span></summary>
          <ExternalTranslatorOptions language={translationTarget} panelLanguage={panelLanguage} />
        </details>

        <button type="button" className="reading-locale-save" onClick={() => onSave({ region, primaryLanguage, translationTarget })}>
          {text(copy => copy.save)}
        </button>
        <p className="reading-locale-footnote">{text(copy => copy.settingsNote)}</p>
      </section>
    </div>
  );
}

export function ReadingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<ReadingLocale>(DEFAULT_READING_LOCALE);
  const [configured, setConfigured] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [panelLanguage, setPanelLanguage] = useState<PanelLanguage>('bilingual');
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) {
      setLocaleState(stored);
      setConfigured(true);
      setPanelLanguage(stored.translationTarget);
      document.documentElement.dataset.language = stored.primaryLanguage;
      document.documentElement.dataset.readingLanguage = stored.translationTarget;
    } else {
      let active = true;
      const browserLanguage = readingLanguageFromBrowser(navigator.languages);
      const translationTarget = browserLanguage || DEFAULT_READING_LOCALE.translationTarget;
      const primaryLanguage: SiteLanguage = browserLanguage === 'en' ? 'en' : 'zh';
      readCloudflareCountryCode()
        .then(countryCode => {
          if (!active) return;
          const regionalSuggestion = readingLocaleFromCountry(countryCode);
          const suggested: ReadingLocale = {
            region: regionalSuggestion?.region || DEFAULT_READING_LOCALE.region,
            primaryLanguage,
            translationTarget: browserLanguage || regionalSuggestion?.language || translationTarget,
          };
          setLocaleState(suggested);
          setPanelLanguage(browserLanguage || 'bilingual');
          setDetected(Boolean(browserLanguage || regionalSuggestion));
          setDialogOpen(true);
        })
        .catch(() => {
          if (!active) return;
          const suggested: ReadingLocale = {
            region: DEFAULT_READING_LOCALE.region,
            primaryLanguage,
            translationTarget,
          };
          setLocaleState(suggested);
          setPanelLanguage(browserLanguage || 'bilingual');
          setDetected(Boolean(browserLanguage));
          setDialogOpen(true);
        });
      return () => { active = false; };
    }

    const open = () => setDialogOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  const setLocale = (nextLocale: ReadingLocale) => {
    setLocaleState(nextLocale);
    setPanelLanguage(nextLocale.translationTarget);
    setConfigured(true);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLocale));
    window.localStorage.setItem('inn-language', nextLocale.primaryLanguage);
    document.documentElement.dataset.language = nextLocale.primaryLanguage;
    document.documentElement.dataset.readingLanguage = nextLocale.translationTarget;
    window.dispatchEvent(new Event('inn-language-change'));
    window.dispatchEvent(new Event('inn-reading-locale-change'));
  };

  useEffect(() => {
    const syncFromStorage = () => {
      const stored = readStoredLocale();
      if (stored) setLocaleState(stored);
    };
    window.addEventListener('inn-reading-locale-change', syncFromStorage);
    return () => window.removeEventListener('inn-reading-locale-change', syncFromStorage);
  }, []);

  const openSettings = () => setDialogOpen(true);
  const value = useMemo(() => ({ locale, configured, setLocale, openSettings }), [locale, configured]);

  return (
    <ReadingLocaleContext.Provider value={value}>
      {children}
      {dialogOpen && (
        <LocaleDialog
          initialLocale={locale}
          panelLanguage={panelLanguage}
          detected={detected}
          forced={!configured}
          onSave={nextLocale => {
            setLocale(nextLocale);
            setDialogOpen(false);
          }}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </ReadingLocaleContext.Provider>
  );
}

export function useReadingLocale() {
  const context = useContext(ReadingLocaleContext);
  if (!context) throw new Error('useReadingLocale must be used inside ReadingLocaleProvider.');
  return context;
}

export function ReadingLocaleSettingsButton({ compact = false }: { compact?: boolean }) {
  const { locale, openSettings } = useReadingLocale();
  const languageName = readingLanguageNativeName(locale.translationTarget);

  return (
    <div className={`reading-locale-control${compact ? ' reading-locale-control--compact' : ''}`}>
      <button
        type="button"
        className="reading-locale-settings"
        onClick={openSettings}
        aria-label={`Change reading language. Current language: ${languageName}`}
        title="Change reading language"
      >
        <strong>{languageName}</strong>
        <svg className="reading-locale-chevron" viewBox="0 0 16 16" aria-hidden="true">
          <path d="m3.2 5.7 4.8 4.8 4.8-4.8" />
        </svg>
      </button>
      <button
        type="button"
        className="reading-locale-settings-quick"
        onClick={openSettings}
        aria-label="Open reading language settings"
        title="Open reading language settings"
      >
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
