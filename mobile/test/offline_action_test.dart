import 'package:asoftech_business_suite/core/sync/offline_action.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('OfflineAction round-trip JSON', () {
    final action = OfflineAction(
      id: 'offline_1',
      type: OfflineActionType.updateStatus,
      leadId: 'lead-1',
      payload: {'status': 'Contacted'},
      retryCount: 1,
      lastError: 'timeout',
    );

    final restored = OfflineAction.fromJson(action.toJson());
    expect(restored.id, action.id);
    expect(restored.type, OfflineActionType.updateStatus);
    expect(restored.leadId, 'lead-1');
    expect(restored.payload['status'], 'Contacted');
    expect(restored.retryCount, 1);
    expect(restored.lastError, 'timeout');
  });

  test('OfflineActionType fromValue', () {
    expect(OfflineActionType.fromValue('create_lead'), OfflineActionType.createLead);
    expect(OfflineActionType.fromValue('unknown'), isNull);
  });
}
