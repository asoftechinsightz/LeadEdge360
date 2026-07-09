import 'package:asoftech_business_suite/features/auth/domain/models/app_user.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AppUser', () {
    test('fromJson maps orgId and products', () {
      final user = AppUser.fromJson({
        'id': 'u1',
        'orgId': 'asoftechinsightz',
        'email': 'admin@asoftechinsightz.com',
        'fullName': 'Admin',
        'role': 'admin',
        'products': ['leadedge360', 'retailedge360'],
        'activeProduct': 'leadedge360',
      });

      expect(user.orgId, 'asoftechinsightz');
      expect(user.products.length, 2);
      expect(user.displayName, 'Admin');
    });

    test('fromJson accepts tenantId alias', () {
      final user = AppUser.fromJson({
        'id': 'u2',
        'tenantId': 'demo-org',
        'email': 'a@test.com',
      });
      expect(user.orgId, 'demo-org');
    });
  });

  group('AuthTokens', () {
    test('fromJson parses nested user', () {
      final tokens = AuthTokens.fromJson({
        'accessToken': 'at',
        'refreshToken': 'rt',
        'expiresIn': 900,
        'user': {'id': '1', 'orgId': 'org', 'email': 'e@e.com'},
      });
      expect(tokens.accessToken, 'at');
      expect(tokens.user.email, 'e@e.com');
    });
  });
}
