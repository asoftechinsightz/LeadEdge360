import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_hi.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('hi')
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'RetailEdge360'**
  String get appName;

  /// No description provided for @dashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get dashboard;

  /// No description provided for @pos.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get pos;

  /// No description provided for @inventory.
  ///
  /// In en, this message translates to:
  /// **'Inventory'**
  String get inventory;

  /// No description provided for @todaySales.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Sales'**
  String get todaySales;

  /// No description provided for @totalSkus.
  ///
  /// In en, this message translates to:
  /// **'Total SKUs'**
  String get totalSkus;

  /// No description provided for @createBill.
  ///
  /// In en, this message translates to:
  /// **'Create Bill'**
  String get createBill;

  /// No description provided for @sendOffer.
  ///
  /// In en, this message translates to:
  /// **'Send Offer'**
  String get sendOffer;

  /// No description provided for @scanSku.
  ///
  /// In en, this message translates to:
  /// **'Scan SKU'**
  String get scanSku;

  /// No description provided for @cash.
  ///
  /// In en, this message translates to:
  /// **'Cash'**
  String get cash;

  /// No description provided for @upi.
  ///
  /// In en, this message translates to:
  /// **'UPI'**
  String get upi;

  /// No description provided for @card.
  ///
  /// In en, this message translates to:
  /// **'Card'**
  String get card;

  /// No description provided for @billSuccess.
  ///
  /// In en, this message translates to:
  /// **'Bill Successful'**
  String get billSuccess;

  /// No description provided for @sendWhatsApp.
  ///
  /// In en, this message translates to:
  /// **'Send on WhatsApp'**
  String get sendWhatsApp;

  /// No description provided for @printBill.
  ///
  /// In en, this message translates to:
  /// **'Print Bill'**
  String get printBill;

  /// No description provided for @offlinePending.
  ///
  /// In en, this message translates to:
  /// **'Offline - {count} bills pending'**
  String offlinePending(int count);

  /// No description provided for @offlineCashOnly.
  ///
  /// In en, this message translates to:
  /// **'Offline — cash billing only'**
  String get offlineCashOnly;

  /// No description provided for @receiptCgst.
  ///
  /// In en, this message translates to:
  /// **'CGST @ {rate}%'**
  String receiptCgst(String rate);

  /// No description provided for @receiptSgst.
  ///
  /// In en, this message translates to:
  /// **'SGST @ {rate}%'**
  String receiptSgst(String rate);

  /// No description provided for @receiptGstin.
  ///
  /// In en, this message translates to:
  /// **'GSTIN'**
  String get receiptGstin;

  /// No description provided for @receiptShop.
  ///
  /// In en, this message translates to:
  /// **'Shop'**
  String get receiptShop;

  /// No description provided for @receiptPdfGenerating.
  ///
  /// In en, this message translates to:
  /// **'Generating PDF…'**
  String get receiptPdfGenerating;

  /// No description provided for @receiptPdfFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not generate PDF: {error}'**
  String receiptPdfFailed(String error);

  /// No description provided for @receiptWaSent.
  ///
  /// In en, this message translates to:
  /// **'Bill sent on WhatsApp'**
  String get receiptWaSent;

  /// No description provided for @receiptEnterPhone.
  ///
  /// In en, this message translates to:
  /// **'Customer WhatsApp number'**
  String get receiptEnterPhone;

  /// No description provided for @receiptOfflinePdf.
  ///
  /// In en, this message translates to:
  /// **'PDF available after bill syncs online'**
  String get receiptOfflinePdf;

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Asoftech Business Suite'**
  String get appTitle;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navPos.
  ///
  /// In en, this message translates to:
  /// **'POS'**
  String get navPos;

  /// No description provided for @navInventory.
  ///
  /// In en, this message translates to:
  /// **'Inventory'**
  String get navInventory;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @retailDashboardTitle.
  ///
  /// In en, this message translates to:
  /// **'Retail Command Center'**
  String get retailDashboardTitle;

  /// No description provided for @retailDashboardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Inventory, RevenueShield AI & growth KPIs'**
  String get retailDashboardSubtitle;

  /// No description provided for @kpiTotalSkus.
  ///
  /// In en, this message translates to:
  /// **'Total SKUs'**
  String get kpiTotalSkus;

  /// No description provided for @kpiInventoryValue.
  ///
  /// In en, this message translates to:
  /// **'Inventory value'**
  String get kpiInventoryValue;

  /// No description provided for @kpiAtRiskValue.
  ///
  /// In en, this message translates to:
  /// **'At-risk value'**
  String get kpiAtRiskValue;

  /// No description provided for @kpiRevenueShielded.
  ///
  /// In en, this message translates to:
  /// **'Revenue shielded'**
  String get kpiRevenueShielded;

  /// No description provided for @kpiHighRiskSkus.
  ///
  /// In en, this message translates to:
  /// **'High risk SKUs'**
  String get kpiHighRiskSkus;

  /// No description provided for @openPosCheckout.
  ///
  /// In en, this message translates to:
  /// **'Open POS checkout'**
  String get openPosCheckout;

  /// No description provided for @salesHistory.
  ///
  /// In en, this message translates to:
  /// **'Sales history'**
  String get salesHistory;

  /// No description provided for @browseInventory.
  ///
  /// In en, this message translates to:
  /// **'Browse inventory'**
  String get browseInventory;

  /// No description provided for @emptyCatalogTitle.
  ///
  /// In en, this message translates to:
  /// **'Set up your retail catalog'**
  String get emptyCatalogTitle;

  /// No description provided for @emptyCatalogSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Add SKUs from the Inventory tab, or use Settings → Load demo data for a quick walkthrough.'**
  String get emptyCatalogSubtitle;

  /// No description provided for @highRiskSkus.
  ///
  /// In en, this message translates to:
  /// **'High-risk SKUs'**
  String get highRiskSkus;

  /// No description provided for @noHighRiskSkus.
  ///
  /// In en, this message translates to:
  /// **'No high-risk SKUs — great shelf-life health.'**
  String get noHighRiskSkus;

  /// No description provided for @retailDashboardUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Retail dashboard unavailable'**
  String get retailDashboardUnavailable;

  /// No description provided for @inventoryByCategory.
  ///
  /// In en, this message translates to:
  /// **'Inventory by category'**
  String get inventoryByCategory;

  /// No description provided for @riskDistribution.
  ///
  /// In en, this message translates to:
  /// **'Risk distribution'**
  String get riskDistribution;

  /// No description provided for @posCheckout.
  ///
  /// In en, this message translates to:
  /// **'POS Checkout'**
  String get posCheckout;

  /// No description provided for @scanOrEnterSku.
  ///
  /// In en, this message translates to:
  /// **'Scan or enter SKU / barcode'**
  String get scanOrEnterSku;

  /// No description provided for @scanSkuToCart.
  ///
  /// In en, this message translates to:
  /// **'Scan a SKU to add to cart'**
  String get scanSkuToCart;

  /// No description provided for @paymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Payment method'**
  String get paymentMethod;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @completeSale.
  ///
  /// In en, this message translates to:
  /// **'Complete sale'**
  String get completeSale;

  /// No description provided for @processing.
  ///
  /// In en, this message translates to:
  /// **'Processing…'**
  String get processing;

  /// No description provided for @paymentCash.
  ///
  /// In en, this message translates to:
  /// **'Cash'**
  String get paymentCash;

  /// No description provided for @paymentUpi.
  ///
  /// In en, this message translates to:
  /// **'UPI'**
  String get paymentUpi;

  /// No description provided for @paymentCard.
  ///
  /// In en, this message translates to:
  /// **'Card'**
  String get paymentCard;

  /// No description provided for @scanBarcode.
  ///
  /// In en, this message translates to:
  /// **'Scan barcode'**
  String get scanBarcode;

  /// No description provided for @skuNotFound.
  ///
  /// In en, this message translates to:
  /// **'SKU not found: {code}'**
  String skuNotFound(String code);

  /// No description provided for @saleCompleted.
  ///
  /// In en, this message translates to:
  /// **'Sale completed'**
  String get saleCompleted;

  /// No description provided for @checkoutFailed.
  ///
  /// In en, this message translates to:
  /// **'Checkout failed: {error}'**
  String checkoutFailed(String error);

  /// No description provided for @paymentGatewayNotConfigured.
  ///
  /// In en, this message translates to:
  /// **'Payment gateway not configured — use cash'**
  String get paymentGatewayNotConfigured;

  /// No description provided for @couldNotStartPayment.
  ///
  /// In en, this message translates to:
  /// **'Could not start payment'**
  String get couldNotStartPayment;

  /// No description provided for @paymentCancelled.
  ///
  /// In en, this message translates to:
  /// **'Payment cancelled'**
  String get paymentCancelled;

  /// No description provided for @salesHistoryTitle.
  ///
  /// In en, this message translates to:
  /// **'Sales history'**
  String get salesHistoryTitle;

  /// No description provided for @noSalesYet.
  ///
  /// In en, this message translates to:
  /// **'No sales yet'**
  String get noSalesYet;

  /// No description provided for @salesError.
  ///
  /// In en, this message translates to:
  /// **'Error: {error}'**
  String salesError(String error);

  /// No description provided for @salesItemsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} items · {method}'**
  String salesItemsCount(int count, String method);

  /// No description provided for @inventorySearchHint.
  ///
  /// In en, this message translates to:
  /// **'Search SKU, name, store…'**
  String get inventorySearchHint;

  /// No description provided for @skusCount.
  ///
  /// In en, this message translates to:
  /// **'{count} SKUs'**
  String skusCount(int count);

  /// No description provided for @inventoryLoadError.
  ///
  /// In en, this message translates to:
  /// **'Could not load inventory'**
  String get inventoryLoadError;

  /// No description provided for @noSkusYet.
  ///
  /// In en, this message translates to:
  /// **'No SKUs yet'**
  String get noSkusYet;

  /// No description provided for @noSkusSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Add your first product to track stock, pricing, and AI shelf-life risk.'**
  String get noSkusSubtitle;

  /// No description provided for @removeSkuTitle.
  ///
  /// In en, this message translates to:
  /// **'Remove SKU?'**
  String get removeSkuTitle;

  /// No description provided for @removeSkuMessage.
  ///
  /// In en, this message translates to:
  /// **'Delete {name} ({sku}) from inventory?'**
  String removeSkuMessage(String name, String sku);

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @remove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get remove;

  /// No description provided for @skuRemoved.
  ///
  /// In en, this message translates to:
  /// **'SKU removed'**
  String get skuRemoved;

  /// No description provided for @removeFailed.
  ///
  /// In en, this message translates to:
  /// **'Remove failed'**
  String get removeFailed;

  /// No description provided for @productName.
  ///
  /// In en, this message translates to:
  /// **'Product name *'**
  String get productName;

  /// No description provided for @skuLabel.
  ///
  /// In en, this message translates to:
  /// **'SKU *'**
  String get skuLabel;

  /// No description provided for @category.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get category;

  /// No description provided for @store.
  ///
  /// In en, this message translates to:
  /// **'Store'**
  String get store;

  /// No description provided for @price.
  ///
  /// In en, this message translates to:
  /// **'Price (₹)'**
  String get price;

  /// No description provided for @stock.
  ///
  /// In en, this message translates to:
  /// **'Stock'**
  String get stock;

  /// No description provided for @storeLabel.
  ///
  /// In en, this message translates to:
  /// **'Store: {name}'**
  String storeLabel(String name);

  /// No description provided for @stockLabel.
  ///
  /// In en, this message translates to:
  /// **'Stock: {count}'**
  String stockLabel(int count);

  /// No description provided for @priceLabel.
  ///
  /// In en, this message translates to:
  /// **'Price: {amount}'**
  String priceLabel(String amount);

  /// No description provided for @predictedShelfDays.
  ///
  /// In en, this message translates to:
  /// **'Predicted shelf: {days} days'**
  String predictedShelfDays(int days);

  /// No description provided for @repredictAi.
  ///
  /// In en, this message translates to:
  /// **'Re-predict with AI'**
  String get repredictAi;

  /// No description provided for @addSku.
  ///
  /// In en, this message translates to:
  /// **'Add SKU'**
  String get addSku;

  /// No description provided for @addAndPredict.
  ///
  /// In en, this message translates to:
  /// **'Add & predict shelf-life'**
  String get addAndPredict;

  /// No description provided for @updatedShelfRisk.
  ///
  /// In en, this message translates to:
  /// **'Updated: {days}d shelf · {risk} risk'**
  String updatedShelfRisk(String days, String risk);

  /// No description provided for @createdShelfRisk.
  ///
  /// In en, this message translates to:
  /// **'{days}d shelf · {risk} risk'**
  String createdShelfRisk(String days, String risk);

  /// No description provided for @stockMeta.
  ///
  /// In en, this message translates to:
  /// **'Stock {count}'**
  String stockMeta(int count);

  /// No description provided for @shelfMeta.
  ///
  /// In en, this message translates to:
  /// **'{days}d shelf'**
  String shelfMeta(int days);

  /// No description provided for @repredict.
  ///
  /// In en, this message translates to:
  /// **'Re-predict'**
  String get repredict;

  /// No description provided for @removeAction.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get removeAction;

  /// No description provided for @riskHigh.
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get riskHigh;

  /// No description provided for @riskMedium.
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get riskMedium;

  /// No description provided for @riskLow.
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get riskLow;

  /// No description provided for @detailCategory.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get detailCategory;

  /// No description provided for @detailStore.
  ///
  /// In en, this message translates to:
  /// **'Store'**
  String get detailStore;

  /// No description provided for @detailStock.
  ///
  /// In en, this message translates to:
  /// **'Stock'**
  String get detailStock;

  /// No description provided for @detailPrice.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get detailPrice;

  /// No description provided for @detailValue.
  ///
  /// In en, this message translates to:
  /// **'Value'**
  String get detailValue;

  /// No description provided for @detailRisk.
  ///
  /// In en, this message translates to:
  /// **'Risk'**
  String get detailRisk;

  /// No description provided for @detailPredictedShelf.
  ///
  /// In en, this message translates to:
  /// **'Predicted shelf'**
  String get detailPredictedShelf;

  /// No description provided for @revenueShield.
  ///
  /// In en, this message translates to:
  /// **'RevenueShield'**
  String get revenueShield;

  /// No description provided for @daysUnit.
  ///
  /// In en, this message translates to:
  /// **'{count} days'**
  String daysUnit(int count);

  /// No description provided for @receiptTitle.
  ///
  /// In en, this message translates to:
  /// **'Bill / Receipt'**
  String get receiptTitle;

  /// No description provided for @receiptThankYou.
  ///
  /// In en, this message translates to:
  /// **'Thank you for your purchase!'**
  String get receiptThankYou;

  /// No description provided for @receiptBillNo.
  ///
  /// In en, this message translates to:
  /// **'Bill No.'**
  String get receiptBillNo;

  /// No description provided for @receiptDate.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get receiptDate;

  /// No description provided for @receiptPayment.
  ///
  /// In en, this message translates to:
  /// **'Payment'**
  String get receiptPayment;

  /// No description provided for @receiptItems.
  ///
  /// In en, this message translates to:
  /// **'Items'**
  String get receiptItems;

  /// No description provided for @receiptSubtotal.
  ///
  /// In en, this message translates to:
  /// **'Subtotal'**
  String get receiptSubtotal;

  /// No description provided for @receiptTotal.
  ///
  /// In en, this message translates to:
  /// **'Grand Total'**
  String get receiptTotal;

  /// No description provided for @viewReceipt.
  ///
  /// In en, this message translates to:
  /// **'View receipt'**
  String get viewReceipt;

  /// No description provided for @newSale.
  ///
  /// In en, this message translates to:
  /// **'New sale'**
  String get newSale;

  /// No description provided for @shareReceipt.
  ///
  /// In en, this message translates to:
  /// **'Share receipt'**
  String get shareReceipt;

  /// No description provided for @receiptQty.
  ///
  /// In en, this message translates to:
  /// **'Qty'**
  String get receiptQty;

  /// No description provided for @receiptRate.
  ///
  /// In en, this message translates to:
  /// **'Rate'**
  String get receiptRate;

  /// No description provided for @receiptAmount.
  ///
  /// In en, this message translates to:
  /// **'Amount'**
  String get receiptAmount;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @languageSubtitle.
  ///
  /// In en, this message translates to:
  /// **'English or Hindi for RetailEdge360'**
  String get languageSubtitle;

  /// No description provided for @languageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @languageHindi.
  ///
  /// In en, this message translates to:
  /// **'हिंदी (Hindi)'**
  String get languageHindi;

  /// No description provided for @chooseLanguage.
  ///
  /// In en, this message translates to:
  /// **'Choose language'**
  String get chooseLanguage;

  /// No description provided for @profileSecurity.
  ///
  /// In en, this message translates to:
  /// **'Security & privacy'**
  String get profileSecurity;

  /// No description provided for @profileSecuritySub.
  ///
  /// In en, this message translates to:
  /// **'Biometric lock, legal, app info'**
  String get profileSecuritySub;

  /// No description provided for @profileNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get profileNotifications;

  /// No description provided for @profileNotificationsSub.
  ///
  /// In en, this message translates to:
  /// **'Follow-ups, assignments & alerts'**
  String get profileNotificationsSub;

  /// No description provided for @profileBilling.
  ///
  /// In en, this message translates to:
  /// **'Subscription & billing'**
  String get profileBilling;

  /// No description provided for @profileBillingSub.
  ///
  /// In en, this message translates to:
  /// **'Plans, Razorpay checkout, payment history'**
  String get profileBillingSub;

  /// No description provided for @profileWorkspace.
  ///
  /// In en, this message translates to:
  /// **'Workspace setup'**
  String get profileWorkspace;

  /// No description provided for @profileWorkspaceSub.
  ///
  /// In en, this message translates to:
  /// **'Company, branding, team & channels'**
  String get profileWorkspaceSub;

  /// No description provided for @signOut.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get signOut;

  /// No description provided for @switchProduct.
  ///
  /// In en, this message translates to:
  /// **'Switch product'**
  String get switchProduct;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @categoryDairy.
  ///
  /// In en, this message translates to:
  /// **'Dairy'**
  String get categoryDairy;

  /// No description provided for @categoryBakery.
  ///
  /// In en, this message translates to:
  /// **'Bakery'**
  String get categoryBakery;

  /// No description provided for @categoryProduce.
  ///
  /// In en, this message translates to:
  /// **'Produce'**
  String get categoryProduce;

  /// No description provided for @categoryMeat.
  ///
  /// In en, this message translates to:
  /// **'Meat'**
  String get categoryMeat;

  /// No description provided for @categoryBeverage.
  ///
  /// In en, this message translates to:
  /// **'Beverage'**
  String get categoryBeverage;

  /// No description provided for @categoryPharma.
  ///
  /// In en, this message translates to:
  /// **'Pharma'**
  String get categoryPharma;

  /// No description provided for @categoryCosmetic.
  ///
  /// In en, this message translates to:
  /// **'Cosmetic'**
  String get categoryCosmetic;

  /// No description provided for @categoryElectronics.
  ///
  /// In en, this message translates to:
  /// **'Electronics'**
  String get categoryElectronics;

  /// No description provided for @categoryHousehold.
  ///
  /// In en, this message translates to:
  /// **'Household'**
  String get categoryHousehold;

  /// No description provided for @categoryOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get categoryOther;

  /// No description provided for @quickSetupTitle.
  ///
  /// In en, this message translates to:
  /// **'10 Minute Dukaan Setup'**
  String get quickSetupTitle;

  /// No description provided for @quickSetupSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Get your shop billing-ready in under 10 minutes'**
  String get quickSetupSubtitle;

  /// No description provided for @quickSetupStepOf.
  ///
  /// In en, this message translates to:
  /// **'Step {current} of {total}'**
  String quickSetupStepOf(int current, int total);

  /// No description provided for @quickStep1Title.
  ///
  /// In en, this message translates to:
  /// **'Shop details'**
  String get quickStep1Title;

  /// No description provided for @quickStep1Hint.
  ///
  /// In en, this message translates to:
  /// **'दुकान की जानकारी'**
  String get quickStep1Hint;

  /// No description provided for @quickShopName.
  ///
  /// In en, this message translates to:
  /// **'Shop name'**
  String get quickShopName;

  /// No description provided for @quickCity.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get quickCity;

  /// No description provided for @quickPhone.
  ///
  /// In en, this message translates to:
  /// **'Owner phone'**
  String get quickPhone;

  /// No description provided for @quickGstin.
  ///
  /// In en, this message translates to:
  /// **'GSTIN (optional)'**
  String get quickGstin;

  /// No description provided for @quickStep2Title.
  ///
  /// In en, this message translates to:
  /// **'Add products'**
  String get quickStep2Title;

  /// No description provided for @quickStep2Hint.
  ///
  /// In en, this message translates to:
  /// **'सामान जोड़ें'**
  String get quickStep2Hint;

  /// No description provided for @quickScanBarcodes.
  ///
  /// In en, this message translates to:
  /// **'Scan 3 barcodes'**
  String get quickScanBarcodes;

  /// No description provided for @quickScanBarcodesSub.
  ///
  /// In en, this message translates to:
  /// **'Use camera to scan product barcodes'**
  String get quickScanBarcodesSub;

  /// No description provided for @quickKiranaTemplate.
  ///
  /// In en, this message translates to:
  /// **'Add kirana template'**
  String get quickKiranaTemplate;

  /// No description provided for @quickKiranaTemplateSub.
  ///
  /// In en, this message translates to:
  /// **'Seeds 20 common grocery SKUs instantly'**
  String get quickKiranaTemplateSub;

  /// No description provided for @quickScannedCount.
  ///
  /// In en, this message translates to:
  /// **'{count} of 3 scanned'**
  String quickScannedCount(int count);

  /// No description provided for @quickStep3Title.
  ///
  /// In en, this message translates to:
  /// **'Payment setup'**
  String get quickStep3Title;

  /// No description provided for @quickStep3Hint.
  ///
  /// In en, this message translates to:
  /// **'भुगतान'**
  String get quickStep3Hint;

  /// No description provided for @quickUpiId.
  ///
  /// In en, this message translates to:
  /// **'UPI ID'**
  String get quickUpiId;

  /// No description provided for @quickCashOnly.
  ///
  /// In en, this message translates to:
  /// **'Cash only'**
  String get quickCashOnly;

  /// No description provided for @quickCashOnlySub.
  ///
  /// In en, this message translates to:
  /// **'Disable UPI / card for now'**
  String get quickCashOnlySub;

  /// No description provided for @quickStep4Title.
  ///
  /// In en, this message translates to:
  /// **'Demo bill'**
  String get quickStep4Title;

  /// No description provided for @quickStep4Hint.
  ///
  /// In en, this message translates to:
  /// **'डेमो बिल'**
  String get quickStep4Hint;

  /// No description provided for @quickDemoIntro.
  ///
  /// In en, this message translates to:
  /// **'Create your first bill — tap the item, then complete sale'**
  String get quickDemoIntro;

  /// No description provided for @quickAddToBill.
  ///
  /// In en, this message translates to:
  /// **'Add to bill'**
  String get quickAddToBill;

  /// No description provided for @quickDemoComplete.
  ///
  /// In en, this message translates to:
  /// **'Complete demo sale'**
  String get quickDemoComplete;

  /// No description provided for @quickStep4Required.
  ///
  /// In en, this message translates to:
  /// **'Complete this demo bill to continue'**
  String get quickStep4Required;

  /// No description provided for @quickStep5Title.
  ///
  /// In en, this message translates to:
  /// **'Send test bill'**
  String get quickStep5Title;

  /// No description provided for @quickStep5Hint.
  ///
  /// In en, this message translates to:
  /// **'टेस्ट भेजें'**
  String get quickStep5Hint;

  /// No description provided for @quickTestWaIntro.
  ///
  /// In en, this message translates to:
  /// **'Send a sample bill to your WhatsApp number'**
  String get quickTestWaIntro;

  /// No description provided for @quickSendTestBill.
  ///
  /// In en, this message translates to:
  /// **'Send test bill on WhatsApp'**
  String get quickSendTestBill;

  /// No description provided for @quickFinish.
  ///
  /// In en, this message translates to:
  /// **'Open POS'**
  String get quickFinish;

  /// No description provided for @quickNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get quickNext;

  /// No description provided for @quickBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get quickBack;

  /// No description provided for @quickSettingUp.
  ///
  /// In en, this message translates to:
  /// **'Setting up your dukaan…'**
  String get quickSettingUp;

  /// No description provided for @quickSetupFailed.
  ///
  /// In en, this message translates to:
  /// **'Setup failed: {error}'**
  String quickSetupFailed(String error);

  /// No description provided for @quickFieldRequired.
  ///
  /// In en, this message translates to:
  /// **'This field is required'**
  String get quickFieldRequired;

  /// No description provided for @refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// No description provided for @quickActions.
  ///
  /// In en, this message translates to:
  /// **'Quick Actions'**
  String get quickActions;

  /// No description provided for @moreModules.
  ///
  /// In en, this message translates to:
  /// **'More Modules'**
  String get moreModules;

  /// No description provided for @openWebApp.
  ///
  /// In en, this message translates to:
  /// **'Open full web app'**
  String get openWebApp;

  /// No description provided for @comingSoonBody.
  ///
  /// In en, this message translates to:
  /// **'This module is coming soon to the app. You can use it now in the full web dashboard.'**
  String get comingSoonBody;

  /// No description provided for @fastMoving.
  ///
  /// In en, this message translates to:
  /// **'Fast moving'**
  String get fastMoving;

  /// No description provided for @slowMoving.
  ///
  /// In en, this message translates to:
  /// **'Slow moving'**
  String get slowMoving;

  /// No description provided for @aiSearchHint.
  ///
  /// In en, this message translates to:
  /// **'Ask AI — reorder, slow movers, profit…'**
  String get aiSearchHint;

  /// No description provided for @aiAsk.
  ///
  /// In en, this message translates to:
  /// **'Ask RetailEdge AI'**
  String get aiAsk;

  /// No description provided for @aiHealthScore.
  ///
  /// In en, this message translates to:
  /// **'Business Health'**
  String get aiHealthScore;

  /// No description provided for @aiRecommendations.
  ///
  /// In en, this message translates to:
  /// **'AI RECOMMENDATIONS'**
  String get aiRecommendations;

  /// No description provided for @aiHealthy.
  ///
  /// In en, this message translates to:
  /// **'Healthy'**
  String get aiHealthy;

  /// No description provided for @aiGood.
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get aiGood;

  /// No description provided for @aiNeedsAttention.
  ///
  /// In en, this message translates to:
  /// **'Attention'**
  String get aiNeedsAttention;

  /// No description provided for @aiCritical.
  ///
  /// In en, this message translates to:
  /// **'Critical'**
  String get aiCritical;

  /// No description provided for @aiRecoHealthy.
  ///
  /// In en, this message translates to:
  /// **'Your store looks healthy today.'**
  String get aiRecoHealthy;

  /// No description provided for @aiRecoExpiring.
  ///
  /// In en, this message translates to:
  /// **'{count} items expire within 7 days — sell or return soon.'**
  String aiRecoExpiring(int count);

  /// No description provided for @aiRecoReorder.
  ///
  /// In en, this message translates to:
  /// **'Reorder {name} — high demand risk.'**
  String aiRecoReorder(String name);

  /// No description provided for @aiRecoSlow.
  ///
  /// In en, this message translates to:
  /// **'{name} is slow-moving — try a discount.'**
  String aiRecoSlow(String name);

  /// No description provided for @aiQueryReorder.
  ///
  /// In en, this message translates to:
  /// **'Which products should I reorder today?'**
  String get aiQueryReorder;

  /// No description provided for @aiQuerySlow.
  ///
  /// In en, this message translates to:
  /// **'Which items are slow moving?'**
  String get aiQuerySlow;

  /// No description provided for @aiQueryProfit.
  ///
  /// In en, this message translates to:
  /// **'Which products have the highest profit?'**
  String get aiQueryProfit;

  /// No description provided for @aiQuerySummary.
  ///
  /// In en, this message translates to:
  /// **'Show today\'s business summary.'**
  String get aiQuerySummary;

  /// No description provided for @aiQueryExpiring.
  ///
  /// In en, this message translates to:
  /// **'What is expiring soon?'**
  String get aiQueryExpiring;

  /// No description provided for @qaNewBill.
  ///
  /// In en, this message translates to:
  /// **'New Bill'**
  String get qaNewBill;

  /// No description provided for @qaNewBillSub.
  ///
  /// In en, this message translates to:
  /// **'POS billing'**
  String get qaNewBillSub;

  /// No description provided for @qaScan.
  ///
  /// In en, this message translates to:
  /// **'Scan Barcode'**
  String get qaScan;

  /// No description provided for @qaScanSub.
  ///
  /// In en, this message translates to:
  /// **'Bill by scanning'**
  String get qaScanSub;

  /// No description provided for @qaSales.
  ///
  /// In en, this message translates to:
  /// **'Sales'**
  String get qaSales;

  /// No description provided for @qaSalesSub.
  ///
  /// In en, this message translates to:
  /// **'History & receipts'**
  String get qaSalesSub;

  /// No description provided for @qaInventory.
  ///
  /// In en, this message translates to:
  /// **'Inventory'**
  String get qaInventory;

  /// No description provided for @qaInventorySub.
  ///
  /// In en, this message translates to:
  /// **'Stock & products'**
  String get qaInventorySub;

  /// No description provided for @qaAnalytics.
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get qaAnalytics;

  /// No description provided for @qaAnalyticsSub.
  ///
  /// In en, this message translates to:
  /// **'Insights & trends'**
  String get qaAnalyticsSub;

  /// No description provided for @qaExpiry.
  ///
  /// In en, this message translates to:
  /// **'Expiry'**
  String get qaExpiry;

  /// No description provided for @qaExpirySub.
  ///
  /// In en, this message translates to:
  /// **'Batches & alerts'**
  String get qaExpirySub;

  /// No description provided for @qaProducts.
  ///
  /// In en, this message translates to:
  /// **'Products'**
  String get qaProducts;

  /// No description provided for @qaCustomers.
  ///
  /// In en, this message translates to:
  /// **'Customers'**
  String get qaCustomers;

  /// No description provided for @qaSuppliers.
  ///
  /// In en, this message translates to:
  /// **'Suppliers'**
  String get qaSuppliers;

  /// No description provided for @qaPurchases.
  ///
  /// In en, this message translates to:
  /// **'Purchases'**
  String get qaPurchases;

  /// No description provided for @qaOrders.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get qaOrders;

  /// No description provided for @qaExpenses.
  ///
  /// In en, this message translates to:
  /// **'Expenses'**
  String get qaExpenses;

  /// No description provided for @qaCredit.
  ///
  /// In en, this message translates to:
  /// **'Credit'**
  String get qaCredit;

  /// No description provided for @qaLoyalty.
  ///
  /// In en, this message translates to:
  /// **'Loyalty'**
  String get qaLoyalty;

  /// No description provided for @qaReports.
  ///
  /// In en, this message translates to:
  /// **'Reports'**
  String get qaReports;

  /// No description provided for @qaNotifications.
  ///
  /// In en, this message translates to:
  /// **'Alerts'**
  String get qaNotifications;

  /// No description provided for @qaSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get qaSettings;

  /// No description provided for @qaMore.
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get qaMore;

  /// No description provided for @expiryTitle.
  ///
  /// In en, this message translates to:
  /// **'Expiry Management'**
  String get expiryTitle;

  /// No description provided for @expiryTodayLabel.
  ///
  /// In en, this message translates to:
  /// **'Expiring Today'**
  String get expiryTodayLabel;

  /// No description provided for @expiry7Days.
  ///
  /// In en, this message translates to:
  /// **'Next 7 Days'**
  String get expiry7Days;

  /// No description provided for @expiry30Days.
  ///
  /// In en, this message translates to:
  /// **'Next 30 Days'**
  String get expiry30Days;

  /// No description provided for @expiryExpired.
  ///
  /// In en, this message translates to:
  /// **'Expired'**
  String get expiryExpired;

  /// No description provided for @expiryEstLoss.
  ///
  /// In en, this message translates to:
  /// **'Est. Loss'**
  String get expiryEstLoss;

  /// No description provided for @expiryActiveBatches.
  ///
  /// In en, this message translates to:
  /// **'Active Batches'**
  String get expiryActiveBatches;

  /// No description provided for @expiryReturnsPending.
  ///
  /// In en, this message translates to:
  /// **'Returns Pending'**
  String get expiryReturnsPending;

  /// No description provided for @expiryCritical.
  ///
  /// In en, this message translates to:
  /// **'Critical Alerts'**
  String get expiryCritical;

  /// No description provided for @expiryNoCritical.
  ///
  /// In en, this message translates to:
  /// **'No critical alerts. You\'re on top of it!'**
  String get expiryNoCritical;

  /// No description provided for @expiryTopExpiring.
  ///
  /// In en, this message translates to:
  /// **'Top Expiring Products'**
  String get expiryTopExpiring;

  /// No description provided for @expiryFefoHint.
  ///
  /// In en, this message translates to:
  /// **'Sorted by First-Expiry-First-Out (FEFO)'**
  String get expiryFefoHint;

  /// No description provided for @expiryNoData.
  ///
  /// In en, this message translates to:
  /// **'No expiry data yet. Add batch expiry dates to products.'**
  String get expiryNoData;

  /// No description provided for @expiryBatch.
  ///
  /// In en, this message translates to:
  /// **'Batch'**
  String get expiryBatch;

  /// No description provided for @expiryQty.
  ///
  /// In en, this message translates to:
  /// **'Qty'**
  String get expiryQty;

  /// No description provided for @expiryToday.
  ///
  /// In en, this message translates to:
  /// **'Expiring today'**
  String get expiryToday;

  /// No description provided for @expiryDaysLeft.
  ///
  /// In en, this message translates to:
  /// **'{days}d left'**
  String expiryDaysLeft(int days);

  /// No description provided for @expiryExpiredAgo.
  ///
  /// In en, this message translates to:
  /// **'Expired {days}d ago'**
  String expiryExpiredAgo(int days);

  /// No description provided for @expiryTodayChip.
  ///
  /// In en, this message translates to:
  /// **'{count} today'**
  String expiryTodayChip(int count);

  /// No description provided for @expiry7Chip.
  ///
  /// In en, this message translates to:
  /// **'{count} in 7d'**
  String expiry7Chip(int count);

  /// No description provided for @expiryExpiredChip.
  ///
  /// In en, this message translates to:
  /// **'{count} expired'**
  String expiryExpiredChip(int count);
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>['en', 'hi'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {


  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en': return AppLocalizationsEn();
    case 'hi': return AppLocalizationsHi();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.'
  );
}
