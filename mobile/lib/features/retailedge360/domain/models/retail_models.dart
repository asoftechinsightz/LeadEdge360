import 'package:equatable/equatable.dart';
import 'package:intl/intl.dart';

abstract final class RetailCategories {
  static const all = [
    'dairy',
    'bakery',
    'produce',
    'meat',
    'beverage',
    'pharma',
    'cosmetic',
    'electronics',
    'household',
    'other',
  ];
}

class RetailSku extends Equatable {
  const RetailSku({
    required this.id,
    this.name = '',
    this.sku = '',
    this.category = 'other',
    this.price = 0,
    this.stock = 0,
    this.store = '',
    this.daysOnShelf = 0,
    this.predictedShelfDays,
    this.risk = 'Medium',
    this.recommendation = '',
    this.engine = 'rules',
    this.expiryDate,
  });

  factory RetailSku.fromJson(Map<String, dynamic> json) => RetailSku(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        sku: json['sku']?.toString() ?? '',
        category: json['category']?.toString() ?? 'other',
        price: (json['price'] as num?)?.toDouble() ?? 0,
        stock: (json['stock'] as num?)?.toInt() ?? (json['quantity'] as num?)?.toInt() ?? 0,
        store: json['store']?.toString() ?? '',
        daysOnShelf: (json['daysOnShelf'] as num?)?.toInt() ?? 0,
        predictedShelfDays: (json['predictedShelfDays'] as num?)?.toInt(),
        risk: json['risk']?.toString() ?? 'Medium',
        recommendation: json['recommendation']?.toString() ?? '',
        engine: json['engine']?.toString() ?? 'rules',
        expiryDate: json['expiryDate']?.toString(),
      );

  final String id;
  final String name;
  final String sku;
  final String category;
  final double price;
  final int stock;
  final String store;
  final int daysOnShelf;
  final int? predictedShelfDays;
  final String risk;
  final String recommendation;
  final String engine;
  final String? expiryDate;

  double get inventoryValue => price * stock;

  @override
  List<Object?> get props => [id, stock, risk, predictedShelfDays];
}

class RetailKpis extends Equatable {
  const RetailKpis({
    this.total = 0,
    this.highRisk = 0,
    this.medRisk = 0,
    this.lowRisk = 0,
    this.inventoryValue = 0,
    this.atRiskValue = 0,
    this.savedSoFar = 0,
  });

  factory RetailKpis.fromJson(Map<String, dynamic> json) => RetailKpis(
        total: (json['total'] as num?)?.toInt() ?? 0,
        highRisk: (json['highRisk'] as num?)?.toInt() ?? 0,
        medRisk: (json['medRisk'] as num?)?.toInt() ?? 0,
        lowRisk: (json['lowRisk'] as num?)?.toInt() ?? 0,
        inventoryValue: (json['inventoryValue'] as num?)?.toDouble() ?? 0,
        atRiskValue: (json['atRiskValue'] as num?)?.toDouble() ?? 0,
        savedSoFar: (json['savedSoFar'] as num?)?.toDouble() ?? 0,
      );

  final int total;
  final int highRisk;
  final int medRisk;
  final int lowRisk;
  final double inventoryValue;
  final double atRiskValue;
  final double savedSoFar;

  @override
  List<Object?> get props => [total, highRisk, inventoryValue];
}

class RetailStore extends Equatable {
  const RetailStore({required this.id, required this.name, this.code = ''});

  factory RetailStore.fromJson(Map<String, dynamic> json) => RetailStore(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        code: json['code']?.toString() ?? '',
      );

  final String id;
  final String name;
  final String code;

  @override
  List<Object?> get props => [id];
}

class RetailSale extends Equatable {
  const RetailSale({
    required this.id,
    this.totalAmount = 0,
    this.paymentMethod = 'cash',
    this.itemCount = 0,
    this.createdAt,
  });

  factory RetailSale.fromJson(Map<String, dynamic> json) {
    final items = json['items'] as List? ?? [];
    return RetailSale(
      id: json['id']?.toString() ?? '',
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
      paymentMethod: json['paymentMethod']?.toString() ?? 'cash',
      itemCount: items.length,
      createdAt: json['createdAt']?.toString(),
    );
  }

  final String id;
  final double totalAmount;
  final String paymentMethod;
  final int itemCount;
  final String? createdAt;

  @override
  List<Object?> get props => [id, totalAmount];
}

String formatRetailCurrency(num value) {
  final fmt = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
  return fmt.format(value);
}

Map<String, dynamic> unwrapRetailPayload(Map<String, dynamic> json) {
  final data = json['data'];
  if (data is Map) return Map<String, dynamic>.from(data);
  return json;
}
