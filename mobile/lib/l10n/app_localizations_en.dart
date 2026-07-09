// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'RetailEdge360';

  @override
  String get dashboard => 'Dashboard';

  @override
  String get pos => 'Billing';

  @override
  String get inventory => 'Inventory';

  @override
  String get todaySales => 'Today\'s Sales';

  @override
  String get totalSkus => 'Total SKUs';

  @override
  String get createBill => 'Create Bill';

  @override
  String get sendOffer => 'Send Offer';

  @override
  String get scanSku => 'Scan SKU';

  @override
  String get cash => 'Cash';

  @override
  String get upi => 'UPI';

  @override
  String get card => 'Card';

  @override
  String get billSuccess => 'Bill Successful';

  @override
  String get sendWhatsApp => 'Send on WhatsApp';

  @override
  String get printBill => 'Print Bill';

  @override
  String offlinePending(int count) {
    return 'Offline - $count bills pending';
  }

  @override
  String get offlineCashOnly => 'Offline — cash billing only';

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
  String get receiptShop => 'Shop';

  @override
  String get receiptPdfGenerating => 'Generating PDF…';

  @override
  String receiptPdfFailed(String error) {
    return 'Could not generate PDF: $error';
  }

  @override
  String get receiptWaSent => 'Bill sent on WhatsApp';

  @override
  String get receiptEnterPhone => 'Customer WhatsApp number';

  @override
  String get receiptOfflinePdf => 'PDF available after bill syncs online';

  @override
  String get appTitle => 'Asoftech Business Suite';

  @override
  String get navHome => 'Home';

  @override
  String get navPos => 'POS';

  @override
  String get navInventory => 'Inventory';

  @override
  String get navProfile => 'Profile';

  @override
  String get retailDashboardTitle => 'Retail Command Center';

  @override
  String get retailDashboardSubtitle => 'Inventory, RevenueShield AI & growth KPIs';

  @override
  String get kpiTotalSkus => 'Total SKUs';

  @override
  String get kpiInventoryValue => 'Inventory value';

  @override
  String get kpiAtRiskValue => 'At-risk value';

  @override
  String get kpiRevenueShielded => 'Revenue shielded';

  @override
  String get kpiHighRiskSkus => 'High risk SKUs';

  @override
  String get openPosCheckout => 'Open POS checkout';

  @override
  String get salesHistory => 'Sales history';

  @override
  String get browseInventory => 'Browse inventory';

  @override
  String get emptyCatalogTitle => 'Set up your retail catalog';

  @override
  String get emptyCatalogSubtitle => 'Add SKUs from the Inventory tab, or use Settings → Load demo data for a quick walkthrough.';

  @override
  String get highRiskSkus => 'High-risk SKUs';

  @override
  String get noHighRiskSkus => 'No high-risk SKUs — great shelf-life health.';

  @override
  String get retailDashboardUnavailable => 'Retail dashboard unavailable';

  @override
  String get inventoryByCategory => 'Inventory by category';

  @override
  String get riskDistribution => 'Risk distribution';

  @override
  String get posCheckout => 'POS Checkout';

  @override
  String get scanOrEnterSku => 'Scan or enter SKU / barcode';

  @override
  String get scanSkuToCart => 'Scan a SKU to add to cart';

  @override
  String get paymentMethod => 'Payment method';

  @override
  String get total => 'Total';

  @override
  String get completeSale => 'Complete sale';

  @override
  String get processing => 'Processing…';

  @override
  String get paymentCash => 'Cash';

  @override
  String get paymentUpi => 'UPI';

  @override
  String get paymentCard => 'Card';

  @override
  String get scanBarcode => 'Scan barcode';

  @override
  String skuNotFound(String code) {
    return 'SKU not found: $code';
  }

  @override
  String get saleCompleted => 'Sale completed';

  @override
  String checkoutFailed(String error) {
    return 'Checkout failed: $error';
  }

  @override
  String get paymentGatewayNotConfigured => 'Payment gateway not configured — use cash';

  @override
  String get couldNotStartPayment => 'Could not start payment';

  @override
  String get paymentCancelled => 'Payment cancelled';

  @override
  String get salesHistoryTitle => 'Sales history';

  @override
  String get noSalesYet => 'No sales yet';

  @override
  String salesError(String error) {
    return 'Error: $error';
  }

  @override
  String salesItemsCount(int count, String method) {
    return '$count items · $method';
  }

  @override
  String get inventorySearchHint => 'Search SKU, name, store…';

  @override
  String skusCount(int count) {
    return '$count SKUs';
  }

  @override
  String get inventoryLoadError => 'Could not load inventory';

  @override
  String get noSkusYet => 'No SKUs yet';

  @override
  String get noSkusSubtitle => 'Add your first product to track stock, pricing, and AI shelf-life risk.';

  @override
  String get removeSkuTitle => 'Remove SKU?';

  @override
  String removeSkuMessage(String name, String sku) {
    return 'Delete $name ($sku) from inventory?';
  }

  @override
  String get cancel => 'Cancel';

  @override
  String get remove => 'Remove';

  @override
  String get skuRemoved => 'SKU removed';

  @override
  String get removeFailed => 'Remove failed';

  @override
  String get productName => 'Product name *';

  @override
  String get skuLabel => 'SKU *';

  @override
  String get category => 'Category';

  @override
  String get store => 'Store';

  @override
  String get price => 'Price (₹)';

  @override
  String get stock => 'Stock';

  @override
  String storeLabel(String name) {
    return 'Store: $name';
  }

  @override
  String stockLabel(int count) {
    return 'Stock: $count';
  }

  @override
  String priceLabel(String amount) {
    return 'Price: $amount';
  }

  @override
  String predictedShelfDays(int days) {
    return 'Predicted shelf: $days days';
  }

  @override
  String get repredictAi => 'Re-predict with AI';

  @override
  String get addSku => 'Add SKU';

  @override
  String get addAndPredict => 'Add & predict shelf-life';

  @override
  String updatedShelfRisk(String days, String risk) {
    return 'Updated: ${days}d shelf · $risk risk';
  }

  @override
  String createdShelfRisk(String days, String risk) {
    return '${days}d shelf · $risk risk';
  }

  @override
  String stockMeta(int count) {
    return 'Stock $count';
  }

  @override
  String shelfMeta(int days) {
    return '${days}d shelf';
  }

  @override
  String get repredict => 'Re-predict';

  @override
  String get removeAction => 'Remove';

  @override
  String get riskHigh => 'High';

  @override
  String get riskMedium => 'Medium';

  @override
  String get riskLow => 'Low';

  @override
  String get detailCategory => 'Category';

  @override
  String get detailStore => 'Store';

  @override
  String get detailStock => 'Stock';

  @override
  String get detailPrice => 'Price';

  @override
  String get detailValue => 'Value';

  @override
  String get detailRisk => 'Risk';

  @override
  String get detailPredictedShelf => 'Predicted shelf';

  @override
  String get revenueShield => 'RevenueShield';

  @override
  String daysUnit(int count) {
    return '$count days';
  }

  @override
  String get receiptTitle => 'Bill / Receipt';

  @override
  String get receiptThankYou => 'Thank you for your purchase!';

  @override
  String get receiptBillNo => 'Bill No.';

  @override
  String get receiptDate => 'Date';

  @override
  String get receiptPayment => 'Payment';

  @override
  String get receiptItems => 'Items';

  @override
  String get receiptSubtotal => 'Subtotal';

  @override
  String get receiptTotal => 'Grand Total';

  @override
  String get viewReceipt => 'View receipt';

  @override
  String get newSale => 'New sale';

  @override
  String get shareReceipt => 'Share receipt';

  @override
  String get receiptQty => 'Qty';

  @override
  String get receiptRate => 'Rate';

  @override
  String get receiptAmount => 'Amount';

  @override
  String get language => 'Language';

  @override
  String get languageSubtitle => 'English or Hindi for RetailEdge360';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageHindi => 'हिंदी (Hindi)';

  @override
  String get chooseLanguage => 'Choose language';

  @override
  String get profileSecurity => 'Security & privacy';

  @override
  String get profileSecuritySub => 'Biometric lock, legal, app info';

  @override
  String get profileNotifications => 'Notifications';

  @override
  String get profileNotificationsSub => 'Follow-ups, assignments & alerts';

  @override
  String get profileBilling => 'Subscription & billing';

  @override
  String get profileBillingSub => 'Plans, Razorpay checkout, payment history';

  @override
  String get profileWorkspace => 'Workspace setup';

  @override
  String get profileWorkspaceSub => 'Company, branding, team & channels';

  @override
  String get signOut => 'Sign out';

  @override
  String get switchProduct => 'Switch product';

  @override
  String get notifications => 'Notifications';

  @override
  String get retry => 'Retry';

  @override
  String get categoryDairy => 'Dairy';

  @override
  String get categoryBakery => 'Bakery';

  @override
  String get categoryProduce => 'Produce';

  @override
  String get categoryMeat => 'Meat';

  @override
  String get categoryBeverage => 'Beverage';

  @override
  String get categoryPharma => 'Pharma';

  @override
  String get categoryCosmetic => 'Cosmetic';

  @override
  String get categoryElectronics => 'Electronics';

  @override
  String get categoryHousehold => 'Household';

  @override
  String get categoryOther => 'Other';

  @override
  String get quickSetupTitle => '10 Minute Dukaan Setup';

  @override
  String get quickSetupSubtitle => 'Get your shop billing-ready in under 10 minutes';

  @override
  String quickSetupStepOf(int current, int total) {
    return 'Step $current of $total';
  }

  @override
  String get quickStep1Title => 'Shop details';

  @override
  String get quickStep1Hint => 'दुकान की जानकारी';

  @override
  String get quickShopName => 'Shop name';

  @override
  String get quickCity => 'City';

  @override
  String get quickPhone => 'Owner phone';

  @override
  String get quickGstin => 'GSTIN (optional)';

  @override
  String get quickStep2Title => 'Add products';

  @override
  String get quickStep2Hint => 'सामान जोड़ें';

  @override
  String get quickScanBarcodes => 'Scan 3 barcodes';

  @override
  String get quickScanBarcodesSub => 'Use camera to scan product barcodes';

  @override
  String get quickKiranaTemplate => 'Add kirana template';

  @override
  String get quickKiranaTemplateSub => 'Seeds 20 common grocery SKUs instantly';

  @override
  String quickScannedCount(int count) {
    return '$count of 3 scanned';
  }

  @override
  String get quickStep3Title => 'Payment setup';

  @override
  String get quickStep3Hint => 'भुगतान';

  @override
  String get quickUpiId => 'UPI ID';

  @override
  String get quickCashOnly => 'Cash only';

  @override
  String get quickCashOnlySub => 'Disable UPI / card for now';

  @override
  String get quickStep4Title => 'Demo bill';

  @override
  String get quickStep4Hint => 'डेमो बिल';

  @override
  String get quickDemoIntro => 'Create your first bill — tap the item, then complete sale';

  @override
  String get quickAddToBill => 'Add to bill';

  @override
  String get quickDemoComplete => 'Complete demo sale';

  @override
  String get quickStep4Required => 'Complete this demo bill to continue';

  @override
  String get quickStep5Title => 'Send test bill';

  @override
  String get quickStep5Hint => 'टेस्ट भेजें';

  @override
  String get quickTestWaIntro => 'Send a sample bill to your WhatsApp number';

  @override
  String get quickSendTestBill => 'Send test bill on WhatsApp';

  @override
  String get quickFinish => 'Open POS';

  @override
  String get quickNext => 'Next';

  @override
  String get quickBack => 'Back';

  @override
  String get quickSettingUp => 'Setting up your dukaan…';

  @override
  String quickSetupFailed(String error) {
    return 'Setup failed: $error';
  }

  @override
  String get quickFieldRequired => 'This field is required';

  @override
  String get refresh => 'Refresh';

  @override
  String get quickActions => 'Quick Actions';

  @override
  String get moreModules => 'More Modules';

  @override
  String get openWebApp => 'Open full web app';

  @override
  String get comingSoonBody => 'This module is coming soon to the app. You can use it now in the full web dashboard.';

  @override
  String get fastMoving => 'Fast moving';

  @override
  String get slowMoving => 'Slow moving';

  @override
  String get aiSearchHint => 'Ask AI — reorder, slow movers, profit…';

  @override
  String get aiAsk => 'Ask RetailEdge AI';

  @override
  String get aiHealthScore => 'Business Health';

  @override
  String get aiRecommendations => 'AI RECOMMENDATIONS';

  @override
  String get aiHealthy => 'Healthy';

  @override
  String get aiGood => 'Good';

  @override
  String get aiNeedsAttention => 'Attention';

  @override
  String get aiCritical => 'Critical';

  @override
  String get aiRecoHealthy => 'Your store looks healthy today.';

  @override
  String aiRecoExpiring(int count) {
    return '$count items expire within 7 days — sell or return soon.';
  }

  @override
  String aiRecoReorder(String name) {
    return 'Reorder $name — high demand risk.';
  }

  @override
  String aiRecoSlow(String name) {
    return '$name is slow-moving — try a discount.';
  }

  @override
  String get aiQueryReorder => 'Which products should I reorder today?';

  @override
  String get aiQuerySlow => 'Which items are slow moving?';

  @override
  String get aiQueryProfit => 'Which products have the highest profit?';

  @override
  String get aiQuerySummary => 'Show today\'s business summary.';

  @override
  String get aiQueryExpiring => 'What is expiring soon?';

  @override
  String get qaNewBill => 'New Bill';

  @override
  String get qaNewBillSub => 'POS billing';

  @override
  String get qaScan => 'Scan Barcode';

  @override
  String get qaScanSub => 'Bill by scanning';

  @override
  String get qaSales => 'Sales';

  @override
  String get qaSalesSub => 'History & receipts';

  @override
  String get qaInventory => 'Inventory';

  @override
  String get qaInventorySub => 'Stock & products';

  @override
  String get qaAnalytics => 'Analytics';

  @override
  String get qaAnalyticsSub => 'Insights & trends';

  @override
  String get qaExpiry => 'Expiry';

  @override
  String get qaExpirySub => 'Batches & alerts';

  @override
  String get qaProducts => 'Products';

  @override
  String get qaCustomers => 'Customers';

  @override
  String get qaSuppliers => 'Suppliers';

  @override
  String get qaPurchases => 'Purchases';

  @override
  String get qaOrders => 'Orders';

  @override
  String get qaExpenses => 'Expenses';

  @override
  String get qaCredit => 'Credit';

  @override
  String get qaLoyalty => 'Loyalty';

  @override
  String get qaReports => 'Reports';

  @override
  String get qaNotifications => 'Alerts';

  @override
  String get qaSettings => 'Settings';

  @override
  String get qaMore => 'More';

  @override
  String get expiryTitle => 'Expiry Management';

  @override
  String get expiryTodayLabel => 'Expiring Today';

  @override
  String get expiry7Days => 'Next 7 Days';

  @override
  String get expiry30Days => 'Next 30 Days';

  @override
  String get expiryExpired => 'Expired';

  @override
  String get expiryEstLoss => 'Est. Loss';

  @override
  String get expiryActiveBatches => 'Active Batches';

  @override
  String get expiryReturnsPending => 'Returns Pending';

  @override
  String get expiryCritical => 'Critical Alerts';

  @override
  String get expiryNoCritical => 'No critical alerts. You\'re on top of it!';

  @override
  String get expiryTopExpiring => 'Top Expiring Products';

  @override
  String get expiryFefoHint => 'Sorted by First-Expiry-First-Out (FEFO)';

  @override
  String get expiryNoData => 'No expiry data yet. Add batch expiry dates to products.';

  @override
  String get expiryBatch => 'Batch';

  @override
  String get expiryQty => 'Qty';

  @override
  String get expiryToday => 'Expiring today';

  @override
  String expiryDaysLeft(int days) {
    return '${days}d left';
  }

  @override
  String expiryExpiredAgo(int days) {
    return 'Expired ${days}d ago';
  }

  @override
  String expiryTodayChip(int count) {
    return '$count today';
  }

  @override
  String expiry7Chip(int count) {
    return '$count in 7d';
  }

  @override
  String expiryExpiredChip(int count) {
    return '$count expired';
  }
}
