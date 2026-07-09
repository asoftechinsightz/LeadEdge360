import 'package:asoftech_business_suite/features/ai/domain/models/ai_models.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('unwrapAiPayload prefers nested data', () {
    final payload = unwrapAiPayload({
      'success': true,
      'data': {'suggestion': 'Hello', 'engine': 'llm'},
    });
    expect(payload['suggestion'], 'Hello');
    expect(payload['engine'], 'llm');
  });

  test('AiSuggestResult parses suggestion', () {
    final result = AiSuggestResult.fromJson({
      'suggestion': 'Hi there, when can we talk?',
      'engine': 'template-fallback',
      'intents': ['followup', 'proposal'],
    });
    expect(result.suggestion, contains('Hi there'));
    expect(result.engine, 'template-fallback');
    expect(result.intents.length, 2);
  });

  test('AiScoreResult parses score payload', () {
    final result = AiScoreResult.fromJson({
      'leadId': 'l1',
      'score': 85,
      'label': 'Hot',
      'engine': 'rules',
      'reasons': ['High budget', 'Recent activity'],
    });
    expect(result.score, 85);
    expect(result.label, 'Hot');
    expect(result.reasons.first, 'High budget');
  });
}
