import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../leadedge360/domain/models/lead_models.dart';
import '../../data/ai_repository.dart';
import '../../domain/models/ai_models.dart';

class LeadAiState {
  const LeadAiState({
    this.isSuggesting = false,
    this.isScoring = false,
    this.suggestion,
    this.suggestEngine,
    this.lastIntent,
    this.scoreResult,
    this.error,
  });

  final bool isSuggesting;
  final bool isScoring;
  final String? suggestion;
  final String? suggestEngine;
  final String? lastIntent;
  final AiScoreResult? scoreResult;
  final String? error;

  LeadAiState copyWith({
    bool? isSuggesting,
    bool? isScoring,
    String? suggestion,
    String? suggestEngine,
    String? lastIntent,
    AiScoreResult? scoreResult,
    String? error,
    bool clearError = false,
    bool clearSuggestion = false,
  }) =>
      LeadAiState(
        isSuggesting: isSuggesting ?? this.isSuggesting,
        isScoring: isScoring ?? this.isScoring,
        suggestion: clearSuggestion ? null : (suggestion ?? this.suggestion),
        suggestEngine: clearSuggestion ? null : (suggestEngine ?? this.suggestEngine),
        lastIntent: lastIntent ?? this.lastIntent,
        scoreResult: scoreResult ?? this.scoreResult,
        error: clearError ? null : (error ?? this.error),
      );
}

class LeadAiNotifier extends StateNotifier<LeadAiState> {
  LeadAiNotifier(this._repo, this._leadId, this._lead) : super(const LeadAiState());

  final AiRepository _repo;
  final String _leadId;
  Lead _lead;

  Future<AiSuggestResult?> suggest(String intent) async {
    state = state.copyWith(isSuggesting: true, clearError: true, lastIntent: intent);
    try {
      final result = await _repo.suggest(leadId: _leadId, intent: intent, lead: _lead);
      state = state.copyWith(
        isSuggesting: false,
        suggestion: result.suggestion,
        suggestEngine: result.engine,
      );
      return result;
    } catch (e) {
      state = state.copyWith(isSuggesting: false, error: e.toString());
      return null;
    }
  }

  Future<AiScoreResult?> score() async {
    state = state.copyWith(isScoring: true, clearError: true);
    try {
      final result = await _repo.scoreLead(_leadId);
      state = state.copyWith(isScoring: false, scoreResult: result);
      return result;
    } catch (e) {
      state = state.copyWith(isScoring: false, error: e.toString());
      return null;
    }
  }
}

/// Per-lead AI state; family key is lead id string.
final leadAiStateProvider =
    StateNotifierProvider.family<LeadAiNotifier, LeadAiState, Lead>((ref, lead) {
  return LeadAiNotifier(ref.watch(aiRepositoryProvider), lead.id, lead);
});
