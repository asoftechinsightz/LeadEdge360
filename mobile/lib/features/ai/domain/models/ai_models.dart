import 'package:equatable/equatable.dart';

/// Supported intents for `POST /ai/suggest` (matches backend templates).
abstract final class AiIntents {
  static const followup = 'followup';
  static const proposal = 'proposal';
  static const nurture = 'nurture';

  static const labels = {
    followup: 'Follow-up',
    proposal: 'Proposal',
    nurture: 'Nurture',
  };

  static const all = [followup, proposal, nurture];
}

class AiSuggestResult extends Equatable {
  const AiSuggestResult({
    required this.suggestion,
    this.engine = 'template',
    this.intents = const [],
  });

  factory AiSuggestResult.fromJson(Map<String, dynamic> json) => AiSuggestResult(
        suggestion: json['suggestion']?.toString() ?? '',
        engine: json['engine']?.toString() ?? 'template',
        intents: (json['intents'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      );

  final String suggestion;
  final String engine;
  final List<String> intents;

  @override
  List<Object?> get props => [suggestion, engine];
}

class AiScoreResult extends Equatable {
  const AiScoreResult({
    required this.leadId,
    required this.score,
    required this.label,
    this.engine = 'rules',
    this.reasons = const [],
  });

  factory AiScoreResult.fromJson(Map<String, dynamic> json) => AiScoreResult(
        leadId: json['leadId']?.toString() ?? '',
        score: (json['score'] as num?)?.toInt() ?? 0,
        label: json['label']?.toString() ?? json['classification']?.toString() ?? '',
        engine: json['engine']?.toString() ?? 'rules',
        reasons: (json['reasons'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      );

  final String leadId;
  final int score;
  final String label;
  final String engine;
  final List<String> reasons;

  @override
  List<Object?> get props => [leadId, score, label];
}

/// Parses `{ success, data }` or flat API payloads.
Map<String, dynamic> unwrapAiPayload(Map<String, dynamic> json) {
  final data = json['data'];
  if (data is Map) return Map<String, dynamic>.from(data);
  return json;
}
