import 'package:equatable/equatable.dart';

class AppUser extends Equatable {
  const AppUser({
    required this.id,
    required this.orgId,
    required this.email,
    this.fullName,
    this.phone,
    this.role,
    this.products = const [],
    this.activeProduct,
    this.businessSuiteEnabled = true,
    this.subscriptionTier,
    this.picture,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    final productsRaw = json['products'];
    return AppUser(
      id: json['id'] as String? ?? '',
      orgId: json['orgId'] as String? ?? json['tenantId'] as String? ?? '',
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String?,
      phone: json['phone'] as String?,
      role: json['role'] as String?,
      products: productsRaw is List
          ? productsRaw.map((e) => e.toString()).toList()
          : const [],
      activeProduct: json['activeProduct'] as String?,
      businessSuiteEnabled: json['businessSuiteEnabled'] as bool? ?? true,
      subscriptionTier: json['subscriptionTier'] as String?,
      picture: json['picture'] as String?,
    );
  }

  final String id;
  final String orgId;
  final String email;
  final String? fullName;
  final String? phone;
  final String? role;
  final List<String> products;
  final String? activeProduct;
  final bool businessSuiteEnabled;
  final String? subscriptionTier;
  final String? picture;

  String get displayName =>
      (fullName != null && fullName!.isNotEmpty) ? fullName! : email;

  Map<String, dynamic> toJson() => {
        'id': id,
        'orgId': orgId,
        'email': email,
        'fullName': fullName,
        'phone': phone,
        'role': role,
        'products': products,
        'activeProduct': activeProduct,
        'businessSuiteEnabled': businessSuiteEnabled,
        'subscriptionTier': subscriptionTier,
        'picture': picture,
      };

  AppUser copyWith({String? activeProduct}) => AppUser(
        id: id,
        orgId: orgId,
        email: email,
        fullName: fullName,
        phone: phone,
        role: role,
        products: products,
        activeProduct: activeProduct ?? this.activeProduct,
        businessSuiteEnabled: businessSuiteEnabled,
        subscriptionTier: subscriptionTier,
        picture: picture,
      );

  @override
  List<Object?> get props => [id, orgId, email, activeProduct];
}

class AuthTokens extends Equatable {
  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.user,
  });

  factory AuthTokens.fromJson(Map<String, dynamic> json) => AuthTokens(
        accessToken: json['accessToken'] as String? ?? '',
        refreshToken: json['refreshToken'] as String? ?? '',
        expiresIn: json['expiresIn'] as int? ?? 900,
        user: AppUser.fromJson(
          Map<String, dynamic>.from(json['user'] as Map? ?? {}),
        ),
      );

  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final AppUser user;

  @override
  List<Object?> get props => [accessToken, user.id];
}
