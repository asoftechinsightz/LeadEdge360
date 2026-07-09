import '../../l10n/app_localizations.dart';

/// Localized retail labels for risk, payment, and product categories.
class RetailL10n {
  RetailL10n(this.l10n);

  final AppLocalizations l10n;

  String riskLabel(String risk) {
    switch (risk) {
      case 'High':
        return l10n.riskHigh;
      case 'Low':
        return l10n.riskLow;
      default:
        return l10n.riskMedium;
    }
  }

  String paymentLabel(String method) {
    switch (method.toLowerCase()) {
      case 'cash':
        return l10n.cash;
      case 'upi':
        return l10n.upi;
      case 'card':
        return l10n.card;
      default:
        return method;
    }
  }

  String categoryLabel(String category) {
    switch (category) {
      case 'dairy':
        return l10n.categoryDairy;
      case 'bakery':
        return l10n.categoryBakery;
      case 'produce':
        return l10n.categoryProduce;
      case 'meat':
        return l10n.categoryMeat;
      case 'beverage':
        return l10n.categoryBeverage;
      case 'pharma':
        return l10n.categoryPharma;
      case 'cosmetic':
        return l10n.categoryCosmetic;
      case 'electronics':
        return l10n.categoryElectronics;
      case 'household':
        return l10n.categoryHousehold;
      default:
        return l10n.categoryOther;
    }
  }
}
