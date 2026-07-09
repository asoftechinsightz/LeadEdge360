import 'package:asoftech_business_suite/core/notifications/notification_models.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('AppNotification parses read state from readAt', () {
    final n = AppNotification.fromJson({
      'id': 'n1',
      'title': 'Hot lead assigned',
      'body': 'Neha Kapoor — Square Meters Realtors',
      'createdAt': '2026-06-22T10:00:00.000Z',
      'readAt': '2026-06-22T11:00:00.000Z',
    });
    expect(n.read, isTrue);
    expect(n.title, 'Hot lead assigned');
  });

  test('AppNotification unread when no readAt', () {
    final n = AppNotification.fromJson({
      'id': 'n2',
      'subject': 'Follow-up due',
      'message': 'Call in 1 hour',
    });
    expect(n.read, isFalse);
    expect(n.title, 'Follow-up due');
    expect(n.body, 'Call in 1 hour');
  });
}
