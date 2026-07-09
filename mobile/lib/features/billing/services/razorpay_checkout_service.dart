import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

typedef PaymentSuccessHandler = void Function(PaymentSuccessResponse response);
typedef PaymentErrorHandler = void Function(PaymentFailureResponse response);

class RazorpayCheckoutService {
  Razorpay? _razorpay;

  void open({
    required String key,
    required String orderId,
    required int amountPaise,
    required String merchantName,
    required String description,
    required PaymentSuccessHandler onSuccess,
    required PaymentErrorHandler onError,
  }) {
    dispose();
    _razorpay = Razorpay();
    _razorpay!
      ..on(Razorpay.EVENT_PAYMENT_SUCCESS, onSuccess)
      ..on(Razorpay.EVENT_PAYMENT_ERROR, onError)
      ..open({
        'key': key,
        'order_id': orderId,
        'amount': amountPaise,
        'currency': 'INR',
        'name': merchantName,
        'description': description,
      });
  }

  void dispose() {
    _razorpay?.clear();
    _razorpay = null;
  }
}

final razorpayCheckoutServiceProvider = Provider<RazorpayCheckoutService>((ref) {
  final service = RazorpayCheckoutService();
  ref.onDispose(service.dispose);
  return service;
});
