// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get appName => 'RetailEdge360';

  @override
  String get dashboard => 'डैशबोर्ड';

  @override
  String get pos => 'बिलिंग';

  @override
  String get inventory => 'स्टॉक';

  @override
  String get todaySales => 'आज की कमाई';

  @override
  String get totalSkus => 'कुल सामान';

  @override
  String get createBill => 'बिल बनाएं';

  @override
  String get sendOffer => 'ऑफर भेजें';

  @override
  String get scanSku => 'SKU स्कैन करें';

  @override
  String get cash => 'नकद';

  @override
  String get upi => 'यूपीआई';

  @override
  String get card => 'कार्ड';

  @override
  String get billSuccess => 'बिल सफल!';

  @override
  String get sendWhatsApp => 'WhatsApp भेजें';

  @override
  String get printBill => 'प्रिंट करें';

  @override
  String offlinePending(int count) {
    return 'ऑफलाइन - $count बिल पेंडिंग';
  }

  @override
  String get offlineCashOnly => 'ऑफलाइन — सिर्फ नकद बिलिंग';

  @override
  String receiptCgst(String rate) {
    return 'CGST @ $rate%';
  }

  @override
  String receiptSgst(String rate) {
    return 'SGST @ $rate%';
  }

  @override
  String get receiptGstin => 'GSTIN';

  @override
  String get receiptShop => 'दुकान';

  @override
  String get receiptPdfGenerating => 'PDF बन रहा है…';

  @override
  String receiptPdfFailed(String error) {
    return 'PDF नहीं बना: $error';
  }

  @override
  String get receiptWaSent => 'WhatsApp पर बिल भेजा गया';

  @override
  String get receiptEnterPhone => 'ग्राहक का WhatsApp नंबर';

  @override
  String get receiptOfflinePdf => 'ऑनलाइन सिंक के बाद PDF मिलेगा';

  @override
  String get appTitle => 'असॉफ्टेक बिज़नेस सूट';

  @override
  String get navHome => 'होम';

  @override
  String get navPos => 'बिलिंग';

  @override
  String get navInventory => 'स्टॉक';

  @override
  String get navProfile => 'प्रोफ़ाइल';

  @override
  String get retailDashboardTitle => 'रिटेल कमांड सेंटर';

  @override
  String get retailDashboardSubtitle => 'इन्वेंटरी, RevenueShield AI और ग्रोथ KPI';

  @override
  String get kpiTotalSkus => 'कुल SKU';

  @override
  String get kpiInventoryValue => 'स्टॉक मूल्य';

  @override
  String get kpiAtRiskValue => 'जोखिम में मूल्य';

  @override
  String get kpiRevenueShielded => 'बचाया राजस्व';

  @override
  String get kpiHighRiskSkus => 'उच्च जोखिम SKU';

  @override
  String get openPosCheckout => 'POS बिलिंग खोलें';

  @override
  String get salesHistory => 'बिक्री इतिहास';

  @override
  String get browseInventory => 'स्टॉक देखें';

  @override
  String get emptyCatalogTitle => 'अपना रिटेल कैटलॉग सेट करें';

  @override
  String get emptyCatalogSubtitle => 'स्टॉक टैब से SKU जोड़ें, या डेमो डेटा से जल्दी शुरू करें।';

  @override
  String get highRiskSkus => 'उच्च जोखिम SKU';

  @override
  String get noHighRiskSkus => 'कोई उच्च जोखिम SKU नहीं — शेल्फ-लाइफ अच्छी है।';

  @override
  String get retailDashboardUnavailable => 'रिटेल डैशबोर्ड उपलब्ध नहीं';

  @override
  String get inventoryByCategory => 'श्रेणी के अनुसार स्टॉक';

  @override
  String get riskDistribution => 'जोखिम वितरण';

  @override
  String get posCheckout => 'POS बिलिंग';

  @override
  String get scanOrEnterSku => 'SKU / बारकोड स्कैन या दर्ज करें';

  @override
  String get scanSkuToCart => 'कार्ट में जोड़ने के लिए SKU स्कैन करें';

  @override
  String get paymentMethod => 'भुगतान विधि';

  @override
  String get total => 'कुल';

  @override
  String get completeSale => 'बिल पूरा करें';

  @override
  String get processing => 'प्रोसेस हो रहा है…';

  @override
  String get paymentCash => 'नकद';

  @override
  String get paymentUpi => 'यूपीआई';

  @override
  String get paymentCard => 'कार्ड';

  @override
  String get scanBarcode => 'बारकोड स्कैन करें';

  @override
  String skuNotFound(String code) {
    return 'SKU नहीं मिला: $code';
  }

  @override
  String get saleCompleted => 'बिक्री पूर्ण हुई';

  @override
  String checkoutFailed(String error) {
    return 'चेकआउट विफल: $error';
  }

  @override
  String get paymentGatewayNotConfigured => 'पेमेंट गेटवे कॉन्फ़िगर नहीं — नकद उपयोग करें';

  @override
  String get couldNotStartPayment => 'भुगतान शुरू नहीं हो सका';

  @override
  String get paymentCancelled => 'भुगतान रद्द';

  @override
  String get salesHistoryTitle => 'बिक्री इतिहास';

  @override
  String get noSalesYet => 'अभी कोई बिक्री नहीं';

  @override
  String salesError(String error) {
    return 'त्रुटि: $error';
  }

  @override
  String salesItemsCount(int count, String method) {
    return '$count आइटम · $method';
  }

  @override
  String get inventorySearchHint => 'SKU, नाम, दुकान खोजें…';

  @override
  String skusCount(int count) {
    return '$count SKU';
  }

  @override
  String get inventoryLoadError => 'स्टॉक लोड नहीं हो सका';

  @override
  String get noSkusYet => 'अभी कोई SKU नहीं';

  @override
  String get noSkusSubtitle => 'स्टॉक, कीमत और AI शेल्फ-लाइफ ट्रैक करने के लिए पहला उत्पाद जोड़ें।';

  @override
  String get removeSkuTitle => 'SKU हटाएं?';

  @override
  String removeSkuMessage(String name, String sku) {
    return '$name ($sku) स्टॉक से हटाएं?';
  }

  @override
  String get cancel => 'रद्द करें';

  @override
  String get remove => 'हटाएं';

  @override
  String get skuRemoved => 'SKU हटाया गया';

  @override
  String get removeFailed => 'हटाना विफल';

  @override
  String get productName => 'उत्पाद का नाम *';

  @override
  String get skuLabel => 'SKU *';

  @override
  String get category => 'श्रेणी';

  @override
  String get store => 'दुकान';

  @override
  String get price => 'कीमत (₹)';

  @override
  String get stock => 'स्टॉक';

  @override
  String storeLabel(String name) {
    return 'दुकान: $name';
  }

  @override
  String stockLabel(int count) {
    return 'स्टॉक: $count';
  }

  @override
  String priceLabel(String amount) {
    return 'कीमत: $amount';
  }

  @override
  String predictedShelfDays(int days) {
    return 'अनुमानित शेल्फ: $days दिन';
  }

  @override
  String get repredictAi => 'AI से फिर अनुमान लगाएं';

  @override
  String get addSku => 'SKU जोड़ें';

  @override
  String get addAndPredict => 'जोड़ें और शेल्फ-लाइफ अनुमान';

  @override
  String updatedShelfRisk(String days, String risk) {
    return 'अपडेट: $days दिन शेल्फ · $risk जोखिम';
  }

  @override
  String createdShelfRisk(String days, String risk) {
    return '$days दिन शेल्फ · $risk जोखिम';
  }

  @override
  String stockMeta(int count) {
    return 'स्टॉक $count';
  }

  @override
  String shelfMeta(int days) {
    return '$days दिन शेल्फ';
  }

  @override
  String get repredict => 'फिर अनुमान';

  @override
  String get removeAction => 'हटाएं';

  @override
  String get riskHigh => 'उच्च';

  @override
  String get riskMedium => 'मध्यम';

  @override
  String get riskLow => 'कम';

  @override
  String get detailCategory => 'श्रेणी';

  @override
  String get detailStore => 'दुकान';

  @override
  String get detailStock => 'स्टॉक';

  @override
  String get detailPrice => 'कीमत';

  @override
  String get detailValue => 'मूल्य';

  @override
  String get detailRisk => 'जोखिम';

  @override
  String get detailPredictedShelf => 'अनुमानित शेल्फ';

  @override
  String get revenueShield => 'RevenueShield';

  @override
  String daysUnit(int count) {
    return '$count दिन';
  }

  @override
  String get receiptTitle => 'बिल / रसीद';

  @override
  String get receiptThankYou => 'खरीदारी के लिए धन्यवाद!';

  @override
  String get receiptBillNo => 'बिल नं.';

  @override
  String get receiptDate => 'तारीख';

  @override
  String get receiptPayment => 'भुगतान';

  @override
  String get receiptItems => 'आइटम';

  @override
  String get receiptSubtotal => 'उप-योग';

  @override
  String get receiptTotal => 'कुल राशि';

  @override
  String get viewReceipt => 'रसीद देखें';

  @override
  String get newSale => 'नई बिक्री';

  @override
  String get shareReceipt => 'रसीद साझा करें';

  @override
  String get receiptQty => 'मात्रा';

  @override
  String get receiptRate => 'दर';

  @override
  String get receiptAmount => 'राशि';

  @override
  String get language => 'भाषा';

  @override
  String get languageSubtitle => 'RetailEdge360 के लिए अंग्रेज़ी या हिंदी';

  @override
  String get languageEnglish => 'English (अंग्रेज़ी)';

  @override
  String get languageHindi => 'हिंदी';

  @override
  String get chooseLanguage => 'भाषा चुनें';

  @override
  String get profileSecurity => 'सुरक्षा और गोपनीयता';

  @override
  String get profileSecuritySub => 'बायोमेट्रिक लॉक, कानूनी, ऐप जानकारी';

  @override
  String get profileNotifications => 'सूचनाएं';

  @override
  String get profileNotificationsSub => 'फॉलो-अप, असाइनमेंट और अलर्ट';

  @override
  String get profileBilling => 'सब्सक्रिप्शन और बिलिंग';

  @override
  String get profileBillingSub => 'प्लान, Razorpay, भुगतान इतिहास';

  @override
  String get profileWorkspace => 'वर्कस्पेस सेटअप';

  @override
  String get profileWorkspaceSub => 'कंपनी, ब्रांडिंग, टीम और चैनल';

  @override
  String get signOut => 'साइन आउट';

  @override
  String get switchProduct => 'उत्पाद बदलें';

  @override
  String get notifications => 'सूचनाएं';

  @override
  String get retry => 'पुनः प्रयास';

  @override
  String get categoryDairy => 'डेयरी';

  @override
  String get categoryBakery => 'बेकरी';

  @override
  String get categoryProduce => 'सब्ज़ी-फल';

  @override
  String get categoryMeat => 'मांस';

  @override
  String get categoryBeverage => 'पेय';

  @override
  String get categoryPharma => 'दवा';

  @override
  String get categoryCosmetic => 'सौंदर्य';

  @override
  String get categoryElectronics => 'इलेक्ट्रॉनिक्स';

  @override
  String get categoryHousehold => 'घरेलू';

  @override
  String get categoryOther => 'अन्य';

  @override
  String get quickSetupTitle => '10 मिनट दुकान सेटअप';

  @override
  String get quickSetupSubtitle => '10 मिनट में बिलिंग शुरू करें';

  @override
  String quickSetupStepOf(int current, int total) {
    return 'चरण $current / $total';
  }

  @override
  String get quickStep1Title => 'दुकान की जानकारी';

  @override
  String get quickStep1Hint => 'नाम, शहर, फोन';

  @override
  String get quickShopName => 'दुकान का नाम';

  @override
  String get quickCity => 'शहर';

  @override
  String get quickPhone => 'मालिक का फोन';

  @override
  String get quickGstin => 'GSTIN (वैकल्पिक)';

  @override
  String get quickStep2Title => 'सामान जोड़ें';

  @override
  String get quickStep2Hint => 'स्कैन या टेम्प्लेट';

  @override
  String get quickScanBarcodes => '3 बारकोड स्कैन करें';

  @override
  String get quickScanBarcodesSub => 'कैमरे से उत्पाद स्कैन करें';

  @override
  String get quickKiranaTemplate => 'किराना टेम्प्लेट जोड़ें';

  @override
  String get quickKiranaTemplateSub => '20 सामान तुरंत जोड़ें';

  @override
  String quickScannedCount(int count) {
    return '$count / 3 स्कैन';
  }

  @override
  String get quickStep3Title => 'भुगतान';

  @override
  String get quickStep3Hint => 'UPI या नकद';

  @override
  String get quickUpiId => 'UPI ID';

  @override
  String get quickCashOnly => 'सिर्फ नकद';

  @override
  String get quickCashOnlySub => 'अभी UPI/कार्ड बंद रखें';

  @override
  String get quickStep4Title => 'डेमो बिल';

  @override
  String get quickStep4Hint => 'पहला बिल बनाएं';

  @override
  String get quickDemoIntro => 'सामान टैप करें, फिर बिल पूरा करें';

  @override
  String get quickAddToBill => 'बिल में जोड़ें';

  @override
  String get quickDemoComplete => 'डेमो बिल पूरा करें';

  @override
  String get quickStep4Required => 'आगे बढ़ने के लिए डेमो बिल जरूरी है';

  @override
  String get quickStep5Title => 'टेस्ट भेजें';

  @override
  String get quickStep5Hint => 'WhatsApp पर टेस्ट';

  @override
  String get quickTestWaIntro => 'अपने नंबर पर नमूना बिल भेजें';

  @override
  String get quickSendTestBill => 'WhatsApp पर टेस्ट बिल भेजें';

  @override
  String get quickFinish => 'बिलिंग खोलें';

  @override
  String get quickNext => 'आगे';

  @override
  String get quickBack => 'पीछे';

  @override
  String get quickSettingUp => 'दुकान सेट हो रही है…';

  @override
  String quickSetupFailed(String error) {
    return 'सेटअप विफल: $error';
  }

  @override
  String get quickFieldRequired => 'यह जानकारी जरूरी है';

  @override
  String get refresh => 'रिफ्रेश करें';

  @override
  String get quickActions => 'त्वरित क्रियाएँ';

  @override
  String get moreModules => 'और मॉड्यूल';

  @override
  String get openWebApp => 'पूरा वेब ऐप खोलें';

  @override
  String get comingSoonBody => 'यह मॉड्यूल जल्द ही ऐप में आ रहा है। अभी आप इसे पूरे वेब डैशबोर्ड में उपयोग कर सकते हैं।';

  @override
  String get fastMoving => 'तेज़ बिकने वाले';

  @override
  String get slowMoving => 'धीमे बिकने वाले';

  @override
  String get aiSearchHint => 'AI से पूछें — रीऑर्डर, धीमे आइटम, मुनाफ़ा…';

  @override
  String get aiAsk => 'RetailEdge AI से पूछें';

  @override
  String get aiHealthScore => 'बिज़नेस हेल्थ';

  @override
  String get aiRecommendations => 'AI सुझाव';

  @override
  String get aiHealthy => 'स्वस्थ';

  @override
  String get aiGood => 'अच्छा';

  @override
  String get aiNeedsAttention => 'ध्यान दें';

  @override
  String get aiCritical => 'गंभीर';

  @override
  String get aiRecoHealthy => 'आज आपकी दुकान स्वस्थ दिख रही है।';

  @override
  String aiRecoExpiring(int count) {
    return '$count आइटम 7 दिनों में समाप्त हो रहे हैं — जल्द बेचें या लौटाएँ।';
  }

  @override
  String aiRecoReorder(String name) {
    return '$name रीऑर्डर करें — मांग का जोखिम अधिक है।';
  }

  @override
  String aiRecoSlow(String name) {
    return '$name धीमा बिक रहा है — छूट आज़माएँ।';
  }

  @override
  String get aiQueryReorder => 'आज मुझे कौन से प्रोडक्ट रीऑर्डर करने चाहिए?';

  @override
  String get aiQuerySlow => 'कौन से आइटम धीमे बिक रहे हैं?';

  @override
  String get aiQueryProfit => 'किन प्रोडक्ट्स में सबसे ज़्यादा मुनाफ़ा है?';

  @override
  String get aiQuerySummary => 'आज का बिज़नेस सारांश दिखाएँ।';

  @override
  String get aiQueryExpiring => 'जल्द क्या समाप्त हो रहा है?';

  @override
  String get qaNewBill => 'नया बिल';

  @override
  String get qaNewBillSub => 'POS बिलिंग';

  @override
  String get qaScan => 'बारकोड स्कैन';

  @override
  String get qaScanSub => 'स्कैन करके बिल';

  @override
  String get qaSales => 'बिक्री';

  @override
  String get qaSalesSub => 'इतिहास व रसीदें';

  @override
  String get qaInventory => 'इन्वेंट्री';

  @override
  String get qaInventorySub => 'स्टॉक व प्रोडक्ट';

  @override
  String get qaAnalytics => 'एनालिटिक्स';

  @override
  String get qaAnalyticsSub => 'इनसाइट्स व ट्रेंड';

  @override
  String get qaExpiry => 'एक्सपायरी';

  @override
  String get qaExpirySub => 'बैच व अलर्ट';

  @override
  String get qaProducts => 'प्रोडक्ट';

  @override
  String get qaCustomers => 'ग्राहक';

  @override
  String get qaSuppliers => 'सप्लायर';

  @override
  String get qaPurchases => 'खरीद';

  @override
  String get qaOrders => 'ऑर्डर';

  @override
  String get qaExpenses => 'खर्च';

  @override
  String get qaCredit => 'उधार';

  @override
  String get qaLoyalty => 'लॉयल्टी';

  @override
  String get qaReports => 'रिपोर्ट';

  @override
  String get qaNotifications => 'अलर्ट';

  @override
  String get qaSettings => 'सेटिंग्स';

  @override
  String get qaMore => 'और';

  @override
  String get expiryTitle => 'एक्सपायरी प्रबंधन';

  @override
  String get expiryTodayLabel => 'आज समाप्त';

  @override
  String get expiry7Days => 'अगले 7 दिन';

  @override
  String get expiry30Days => 'अगले 30 दिन';

  @override
  String get expiryExpired => 'समाप्त';

  @override
  String get expiryEstLoss => 'अनुमानित नुकसान';

  @override
  String get expiryActiveBatches => 'सक्रिय बैच';

  @override
  String get expiryReturnsPending => 'वापसी लंबित';

  @override
  String get expiryCritical => 'गंभीर अलर्ट';

  @override
  String get expiryNoCritical => 'कोई गंभीर अलर्ट नहीं। सब नियंत्रण में है!';

  @override
  String get expiryTopExpiring => 'जल्द समाप्त होने वाले प्रोडक्ट';

  @override
  String get expiryFefoHint => 'पहले-समाप्त-पहले-निकालें (FEFO) के अनुसार';

  @override
  String get expiryNoData => 'अभी एक्सपायरी डेटा नहीं है। प्रोडक्ट में बैच एक्सपायरी तिथि जोड़ें।';

  @override
  String get expiryBatch => 'बैच';

  @override
  String get expiryQty => 'मात्रा';

  @override
  String get expiryToday => 'आज समाप्त हो रहा';

  @override
  String expiryDaysLeft(int days) {
    return '$days दिन बाकी';
  }

  @override
  String expiryExpiredAgo(int days) {
    return '$days दिन पहले समाप्त';
  }

  @override
  String expiryTodayChip(int count) {
    return '$count आज';
  }

  @override
  String expiry7Chip(int count) {
    return '$count 7 दिन में';
  }

  @override
  String expiryExpiredChip(int count) {
    return '$count समाप्त';
  }
}
