import 'package:asoftech_business_suite/core/config/app_config.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('session idle timeout is 15 minutes', () {
    expect(AppConfig.sessionIdleTimeout.inMinutes, 15);
  });

  test('play store package matches flutter org', () {
    expect(AppConfig.playStorePackage, 'com.asoftechinsightz.asoftech_business_suite');
  });

  test('privacy and terms URLs use production domain', () {
    expect(AppConfig.privacyPolicyUrl, contains('asoftechinsightz.com'));
    expect(AppConfig.termsUrl, contains('asoftechinsightz.com'));
  });
}
