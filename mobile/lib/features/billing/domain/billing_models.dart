class BillingPlan {
  const BillingPlan({
    required this.id,
    required this.name,
    required this.price,
    this.planCode,
    this.currency = 'INR',
    this.custom = false,
  });

  factory BillingPlan.fromJson(Map<String, dynamic> json) => BillingPlan(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'Plan',
        price: (json['price'] as num?)?.toInt() ?? 0,
        planCode: json['planCode']?.toString(),
        currency: json['currency']?.toString() ?? 'INR',
        custom: json['custom'] == true,
      );

  final String id;
  final String name;
  final int price;
  final String? planCode;
  final String currency;
  final bool custom;

  String get priceLabel => custom ? 'Contact sales' : '₹$price/mo';
}

class SubscriptionRecord {
  const SubscriptionRecord({
    required this.id,
    this.planCode,
    this.status,
    this.amount,
    this.trialEndsAt,
  });

  factory SubscriptionRecord.fromJson(Map<String, dynamic> json) => SubscriptionRecord(
        id: json['id']?.toString() ?? '',
        planCode: json['planCode']?.toString(),
        status: json['status']?.toString(),
        amount: (json['amount'] as num?)?.toDouble(),
        trialEndsAt: json['trialEndsAt']?.toString(),
      );

  final String id;
  final String? planCode;
  final String? status;
  final double? amount;
  final String? trialEndsAt;
}

class PaymentRecord {
  const PaymentRecord({
    required this.id,
    this.amount,
    this.status,
    this.plan,
    this.createdAt,
  });

  factory PaymentRecord.fromJson(Map<String, dynamic> json) => PaymentRecord(
        id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
        amount: (json['amount'] as num?)?.toDouble(),
        status: json['status']?.toString(),
        plan: json['plan']?.toString(),
        createdAt: json['createdAt']?.toString(),
      );

  final String id;
  final double? amount;
  final String? status;
  final String? plan;
  final String? createdAt;
}
