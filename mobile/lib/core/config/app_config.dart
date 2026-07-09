/// Runtime configuration — override via `--dart-define`.
class AppConfig {
  AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://asoftechinsightz.com/api',
  );

  /// Web shell base URL — defaults to API host without `/api` suffix.
  static const String webBaseUrlOverride = String.fromEnvironment('WEB_BASE_URL', defaultValue: '');

  static String get webBaseUrl {
    if (webBaseUrlOverride.isNotEmpty) return webBaseUrlOverride;
    if (apiBaseUrl.endsWith('/api')) {
      return apiBaseUrl.substring(0, apiBaseUrl.length - 4);
    }
    return 'https://asoftechinsightz.com';
  }

  static String get retailWebPath => '$webBaseUrl/retailedge360';

  static const String privacyPolicyUrl = String.fromEnvironment(
    'PRIVACY_URL',
    defaultValue: 'https://asoftechinsightz.com/privacy',
  );

  static const String termsUrl = String.fromEnvironment(
    'TERMS_URL',
    defaultValue: 'https://asoftechinsightz.com/terms',
  );

  static const String googleServerClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
    defaultValue: '',
  );
  static const String playStorePackage = 'com.asoftechinsightz.asoftech_business_suite';

  static const String appName = 'Asoftech Business Suite';
  static const Duration accessTokenRefreshBuffer = Duration(minutes: 2);
  static const Duration sessionIdleTimeout = Duration(minutes: 15);
  static const int defaultPageSize = 20;
  static const int syncBatchSize = 1000;
  static const Duration syncPollInterval = Duration(minutes: 10);
  static const int offlineQueueMaxRetries = 5;

  /// Set `--dart-define=ENABLE_FCM=true` after adding `google-services.json`.
  static const bool enableFcm = bool.fromEnvironment('ENABLE_FCM', defaultValue: false);

  static const String hiveBoxCache = 'app_cache';
  static const String hiveBoxOfflineQueue = 'offline_queue';
  static const String keyRetailOfflineQueue = 'retail_checkout_queue';
  static const String keyRetailSkuCache = 'retail_sku_cache';

  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyBiometricEnabled = 'biometric_enabled';
  static const String keyLastActiveAt = 'last_active_at';
  static const String keyCachedUser = 'cached_user';
  static const String keyActiveProduct = 'active_product';
  static const String keyThemeMode = 'theme_mode';
  static const String keyAppLocale = 'language';
  static const String keyCachedLeads = 'cached_leads';
  static const String keyCachedLeadDetails = 'cached_lead_details';
  static const String keyCachedBootstrap = 'cached_bootstrap';
  static const String keyLastSyncAt = 'last_sync_at';
  static const String keyFcmToken = 'fcm_token';
}
