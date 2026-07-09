import 'package:asoftech_business_suite/features/leadedge360/data/leads_repository.dart';
import 'package:asoftech_business_suite/features/leadedge360/domain/models/lead_models.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Lead.fromJson prefers name then company', () {
    final withCompany = Lead.fromJson({
      'id': '1',
      'company': 'Square Meters Realtors',
      'score': 85,
      'label': 'Hot',
      'status': 'New',
    });
    expect(withCompany.name, 'Square Meters Realtors');
    expect(withCompany.score, 85);
  });

  test('LeadDetailBundle parses nested arrays', () {
    final bundle = LeadDetailBundle.fromJson({
      'lead': {'id': 'l1', 'name': 'Test', 'status': 'New'},
      'timeline': [
        {'id': 't1', 'type': 'assigned', 'createdAt': '2026-06-22T10:00:00.000Z'},
      ],
      'notes': [
        {'id': 'n1', 'note': 'Called', 'createdAt': '2026-06-22T11:00:00.000Z'},
      ],
      'followups': [],
      'tasks': [],
    });
    expect(bundle.lead.id, 'l1');
    expect(bundle.timeline.length, 1);
    expect(bundle.notes.first.note, 'Called');
  });

  test('LeadsQuery toParams omits all filters', () {
    const q = LeadsQuery();
    expect(q.toParams(), {'page': 1, 'limit': 20});
  });

  test('LeadsQuery toParams includes filters', () {
    const q = LeadsQuery(status: 'New', label: 'Hot', search: 'noida');
    final p = q.toParams();
    expect(p['status'], 'New');
    expect(p['label'], 'Hot');
    expect(p['q'], 'noida');
  });
}
