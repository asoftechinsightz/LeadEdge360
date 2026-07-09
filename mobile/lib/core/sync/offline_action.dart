/// Queued write operations replayed when connectivity returns.
enum OfflineActionType {
  updateStatus('update_status'),
  addNote('add_note'),
  addFollowUp('add_followup'),
  addTask('add_task'),
  createLead('create_lead'),
  movePipeline('move_pipeline');

  const OfflineActionType(this.value);
  final String value;

  static OfflineActionType? fromValue(String? raw) {
    if (raw == null) return null;
    for (final t in OfflineActionType.values) {
      if (t.value == raw) return t;
    }
    return null;
  }
}

class OfflineAction {
  OfflineAction({
    required this.id,
    required this.type,
    required this.payload,
    this.leadId,
    DateTime? createdAt,
    this.retryCount = 0,
    this.lastError,
  }) : createdAt = createdAt ?? DateTime.now().toUtc();

  factory OfflineAction.fromJson(Map<String, dynamic> json) => OfflineAction(
        id: json['id']?.toString() ?? '',
        type: OfflineActionType.fromValue(json['type']?.toString()) ??
            OfflineActionType.addNote,
        leadId: json['leadId']?.toString(),
        payload: Map<String, dynamic>.from(json['payload'] as Map? ?? {}),
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
            DateTime.now().toUtc(),
        retryCount: (json['retryCount'] as num?)?.toInt() ?? 0,
        lastError: json['lastError']?.toString(),
      );

  final String id;
  final OfflineActionType type;
  final String? leadId;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final int retryCount;
  final String? lastError;

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type.value,
        if (leadId != null) 'leadId': leadId,
        'payload': payload,
        'createdAt': createdAt.toUtc().toIso8601String(),
        'retryCount': retryCount,
        if (lastError != null) 'lastError': lastError,
      };

  OfflineAction copyWith({
    int? retryCount,
    String? lastError,
    bool clearError = false,
  }) =>
      OfflineAction(
        id: id,
        type: type,
        leadId: leadId,
        payload: payload,
        createdAt: createdAt,
        retryCount: retryCount ?? this.retryCount,
        lastError: clearError ? null : (lastError ?? this.lastError),
      );
}
