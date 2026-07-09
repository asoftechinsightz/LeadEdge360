import 'package:equatable/equatable.dart';

/// KPI counters for the Expiry Management dashboard.
class ExpiryKpis extends Equatable {
  const ExpiryKpis({
    this.expiringToday = 0,
    this.expiring7Days = 0,
    this.expiring30Days = 0,
    this.expiring60Days = 0,
    this.expiring90Days = 0,
    this.totalExpired = 0,
    this.estimatedExpiryLoss = 0,
    this.returnPending = 0,
    this.destroyedInventoryValue = 0,
    this.activeBatches = 0,
  });

  factory ExpiryKpis.fromJson(Map<String, dynamic> json) => ExpiryKpis(
        expiringToday: (json['expiringToday'] as num?)?.toInt() ?? 0,
        expiring7Days: (json['expiring7Days'] as num?)?.toInt() ?? 0,
        expiring30Days: (json['expiring30Days'] as num?)?.toInt() ?? 0,
        expiring60Days: (json['expiring60Days'] as num?)?.toInt() ?? 0,
        expiring90Days: (json['expiring90Days'] as num?)?.toInt() ?? 0,
        totalExpired: (json['totalExpired'] as num?)?.toInt() ?? 0,
        estimatedExpiryLoss: (json['estimatedExpiryLoss'] as num?)?.toDouble() ?? 0,
        returnPending: (json['returnPending'] as num?)?.toInt() ?? 0,
        destroyedInventoryValue: (json['destroyedInventoryValue'] as num?)?.toDouble() ?? 0,
        activeBatches: (json['activeBatches'] as num?)?.toInt() ?? 0,
      );

  final int expiringToday;
  final int expiring7Days;
  final int expiring30Days;
  final int expiring60Days;
  final int expiring90Days;
  final int totalExpired;
  final double estimatedExpiryLoss;
  final int returnPending;
  final double destroyedInventoryValue;
  final int activeBatches;

  @override
  List<Object?> get props =>
      [expiringToday, expiring7Days, expiring30Days, totalExpired, activeBatches];
}

/// A near-expiry product/batch item (from widgets.topExpiring or alerts).
class ExpiryItem extends Equatable {
  const ExpiryItem({
    required this.productName,
    this.batchNumber = '',
    this.daysRemaining,
    this.quantity = 0,
    this.value = 0,
    this.level = '',
    this.expiryDate,
  });

  factory ExpiryItem.fromJson(Map<String, dynamic> json) => ExpiryItem(
        productName: json['productName']?.toString() ?? json['name']?.toString() ?? '—',
        batchNumber: json['batchNumber']?.toString() ?? '',
        daysRemaining: (json['daysRemaining'] as num?)?.toInt(),
        quantity: (json['quantity'] as num?)?.toInt() ??
            (json['quantityAvailable'] as num?)?.toInt() ??
            0,
        value: (json['value'] as num?)?.toDouble() ?? 0,
        level: json['level']?.toString() ?? '',
        expiryDate: json['expiryDate']?.toString(),
      );

  final String productName;
  final String batchNumber;
  final int? daysRemaining;
  final int quantity;
  final double value;
  final String level;
  final String? expiryDate;

  bool get isExpired => (daysRemaining ?? 0) < 0;

  @override
  List<Object?> get props => [productName, batchNumber, daysRemaining];
}

/// Full expiry dashboard payload.
class ExpiryDashboard extends Equatable {
  const ExpiryDashboard({
    required this.kpis,
    this.topExpiring = const [],
    this.criticalAlerts = const [],
  });

  factory ExpiryDashboard.fromJson(Map<String, dynamic> json) {
    final widgets = json['widgets'] as Map? ?? {};
    final topRaw = widgets['topExpiring'] as List? ?? [];
    final alertsRaw = json['criticalAlerts'] as List? ?? [];
    return ExpiryDashboard(
      kpis: ExpiryKpis.fromJson(Map<String, dynamic>.from(json['kpis'] as Map? ?? {})),
      topExpiring: topRaw
          .map((e) => ExpiryItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      criticalAlerts: alertsRaw
          .map((e) => ExpiryItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }

  final ExpiryKpis kpis;
  final List<ExpiryItem> topExpiring;
  final List<ExpiryItem> criticalAlerts;

  @override
  List<Object?> get props => [kpis, topExpiring, criticalAlerts];
}
