import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../retailedge360/domain/models/retail_models.dart';
import '../../data/onboarding_repository.dart';
import 'onboarding_providers.dart';

class QuickOnboardingState {
  const QuickOnboardingState({
    this.step = 0,
    this.shopName = '',
    this.city = '',
    this.phone = '',
    this.gstin = '',
    this.useKiranaTemplate = false,
    this.scannedBarcodes = const [],
    this.cashOnly = false,
    this.upiId = '',
    this.isSubmitting = false,
    this.error,
    this.setupDone = false,
    this.storeId,
    this.demoSku,
    this.demoInCart = false,
    this.demoBillComplete = false,
    this.testWaSent = false,
  });

  final int step;
  final String shopName;
  final String city;
  final String phone;
  final String gstin;
  final bool useKiranaTemplate;
  final List<String> scannedBarcodes;
  final bool cashOnly;
  final String upiId;
  final bool isSubmitting;
  final String? error;
  final bool setupDone;
  final String? storeId;
  final RetailSku? demoSku;
  final bool demoInCart;
  final bool demoBillComplete;
  final bool testWaSent;

  static const totalSteps = 5;

  QuickOnboardingState copyWith({
    int? step,
    String? shopName,
    String? city,
    String? phone,
    String? gstin,
    bool? useKiranaTemplate,
    List<String>? scannedBarcodes,
    bool? cashOnly,
    String? upiId,
    bool? isSubmitting,
    String? error,
    bool clearError = false,
    bool? setupDone,
    String? storeId,
    RetailSku? demoSku,
    bool? demoInCart,
    bool? demoBillComplete,
    bool? testWaSent,
  }) {
    return QuickOnboardingState(
      step: step ?? this.step,
      shopName: shopName ?? this.shopName,
      city: city ?? this.city,
      phone: phone ?? this.phone,
      gstin: gstin ?? this.gstin,
      useKiranaTemplate: useKiranaTemplate ?? this.useKiranaTemplate,
      scannedBarcodes: scannedBarcodes ?? this.scannedBarcodes,
      cashOnly: cashOnly ?? this.cashOnly,
      upiId: upiId ?? this.upiId,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: clearError ? null : (error ?? this.error),
      setupDone: setupDone ?? this.setupDone,
      storeId: storeId ?? this.storeId,
      demoSku: demoSku ?? this.demoSku,
      demoInCart: demoInCart ?? this.demoInCart,
      demoBillComplete: demoBillComplete ?? this.demoBillComplete,
      testWaSent: testWaSent ?? this.testWaSent,
    );
  }
}

final quickOnboardingProvider =
    StateNotifierProvider<QuickOnboardingNotifier, QuickOnboardingState>((ref) {
  return QuickOnboardingNotifier(ref);
});

class QuickOnboardingNotifier extends StateNotifier<QuickOnboardingState> {
  QuickOnboardingNotifier(this._ref) : super(const QuickOnboardingState());

  final Ref _ref;

  void setShopName(String v) => state = state.copyWith(shopName: v, clearError: true);
  void setCity(String v) => state = state.copyWith(city: v, clearError: true);
  void setPhone(String v) => state = state.copyWith(phone: v, clearError: true);
  void setGstin(String v) => state = state.copyWith(gstin: v);
  void setUpiId(String v) => state = state.copyWith(upiId: v, clearError: true);
  void setCashOnly(bool v) => state = state.copyWith(cashOnly: v, clearError: true);

  void selectKiranaTemplate() {
    state = state.copyWith(useKiranaTemplate: true, scannedBarcodes: const [], clearError: true);
  }

  void selectBarcodeMode() {
    state = state.copyWith(useKiranaTemplate: false, clearError: true);
  }

  void addBarcode(String code) {
    if (code.trim().isEmpty || state.scannedBarcodes.length >= 3) return;
    if (state.scannedBarcodes.contains(code)) return;
    state = state.copyWith(
      useKiranaTemplate: false,
      scannedBarcodes: [...state.scannedBarcodes, code.trim()],
      clearError: true,
    );
  }

  void removeBarcode(String code) {
    state = state.copyWith(
      scannedBarcodes: state.scannedBarcodes.where((c) => c != code).toList(),
    );
  }

  void addDemoToCart() {
    if (state.demoSku != null) {
      state = state.copyWith(demoInCart: true);
    }
  }

  void markDemoBillComplete() {
    state = state.copyWith(demoBillComplete: true);
  }

  void markTestWaSent() {
    state = state.copyWith(testWaSent: true);
  }

  void setDemoSku(RetailSku sku) {
    state = state.copyWith(demoSku: sku);
  }

  bool validateStep(int step) {
    switch (step) {
      case 0:
        return state.shopName.trim().isNotEmpty &&
            state.city.trim().isNotEmpty &&
            state.phone.trim().length >= 10;
      case 1:
        return state.useKiranaTemplate || state.scannedBarcodes.isNotEmpty;
      case 2:
        return state.cashOnly || state.upiId.trim().isNotEmpty;
      case 3:
        return state.demoBillComplete;
      case 4:
        return true;
      default:
        return false;
    }
  }

  Future<bool> goNext() async {
    if (!validateStep(state.step)) {
      state = state.copyWith(error: 'validation');
      return false;
    }

    if (state.step == 2 && !state.setupDone) {
      final ok = await _submitSetup();
      if (!ok) return false;
    }

    if (state.step < QuickOnboardingState.totalSteps - 1) {
      state = state.copyWith(step: state.step + 1, clearError: true);
      return true;
    }
    return true;
  }

  void goBack() {
    if (state.step > 0) {
      state = state.copyWith(step: state.step - 1, clearError: true);
    }
  }

  Future<bool> _submitSetup() async {
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final repo = _ref.read(onboardingRepositoryProvider);
      final result = await repo.quickSetup(
        shopName: state.shopName.trim(),
        city: state.city.trim(),
        phone: state.phone.trim(),
        gstin: state.gstin.trim().isEmpty ? null : state.gstin.trim(),
        useKiranaTemplate: state.useKiranaTemplate,
        scannedBarcodes: state.scannedBarcodes.map((b) => {'barcode': b}).toList(),
        cashOnly: state.cashOnly,
        upiId: state.cashOnly ? null : state.upiId.trim(),
      );

      _ref.invalidate(onboardingProgressProvider);
      _ref.invalidate(retailQuickSetupNeededProvider);

      state = state.copyWith(
        isSubmitting: false,
        setupDone: true,
        storeId: result['storeId']?.toString(),
      );
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }
}
