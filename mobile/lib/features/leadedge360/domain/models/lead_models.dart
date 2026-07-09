import 'package:equatable/equatable.dart';

class Lead extends Equatable {
  const Lead({
    required this.id,
    this.name = '',
    this.company = '',
    this.phone = '',
    this.email = '',
    this.status = 'New',
    this.label = '',
    this.score = 0,
    this.source = '',
    this.territory = '',
    this.assignedTo = '',
    this.updatedAt,
    this.createdAt,
  });

  factory Lead.fromJson(Map<String, dynamic> json) => Lead(
        id: json['id']?.toString() ?? '',
        name: _displayName(json),
        company: json['company']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        status: json['status']?.toString() ?? 'New',
        label: json['label']?.toString() ?? '',
        score: (json['score'] as num?)?.toInt() ?? 0,
        source: json['source']?.toString() ?? '',
        territory: json['territory']?.toString() ?? '',
        assignedTo: json['assignedTo']?.toString() ?? '',
        updatedAt: _parseDate(json['updatedAt']),
        createdAt: _parseDate(json['createdAt']),
      );

  static String _displayName(Map<String, dynamic> json) {
    final name = json['name']?.toString().trim() ?? '';
    if (name.isNotEmpty) return name;
    return json['company']?.toString() ?? 'Lead';
  }

  static DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    return DateTime.tryParse(v.toString());
  }

  final String id;
  final String name;
  final String company;
  final String phone;
  final String email;
  final String status;
  final String label;
  final int score;
  final String source;
  final String territory;
  final String assignedTo;
  final DateTime? updatedAt;
  final DateTime? createdAt;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'company': company,
        'phone': phone,
        'email': email,
        'status': status,
        'label': label,
        'score': score,
        'source': source,
        'territory': territory,
        'assignedTo': assignedTo,
        if (updatedAt != null) 'updatedAt': updatedAt!.toUtc().toIso8601String(),
        if (createdAt != null) 'createdAt': createdAt!.toUtc().toIso8601String(),
      };

  @override
  List<Object?> get props => [id, status, score, updatedAt];
}

class LeadAttachment extends Equatable {
  const LeadAttachment({
    required this.id,
    required this.fileName,
    this.url,
    this.mimeType,
    this.size,
    this.createdAt,
  });

  factory LeadAttachment.fromJson(Map<String, dynamic> json) => LeadAttachment(
        id: json['id']?.toString() ?? '',
        fileName: json['fileName']?.toString() ?? 'file',
        url: json['url']?.toString(),
        mimeType: json['mimeType']?.toString(),
        size: json['size'] as int?,
        createdAt: Lead._parseDate(json['createdAt']),
      );

  final String id;
  final String fileName;
  final String? url;
  final String? mimeType;
  final int? size;
  final DateTime? createdAt;

  @override
  List<Object?> get props => [id];
}

class LeadNote extends Equatable {
  const LeadNote({required this.id, required this.note, this.createdAt});

  factory LeadNote.fromJson(Map<String, dynamic> json) => LeadNote(
        id: json['id']?.toString() ?? '',
        note: json['note']?.toString() ?? '',
        createdAt: Lead._parseDate(json['createdAt']),
      );

  final String id;
  final String note;
  final DateTime? createdAt;

  @override
  List<Object?> get props => [id];
}

class LeadTask extends Equatable {
  const LeadTask({
    required this.id,
    required this.title,
    this.description = '',
    this.status = 'open',
    this.priority = '',
    this.dueAt,
  });

  factory LeadTask.fromJson(Map<String, dynamic> json) => LeadTask(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        description: json['description']?.toString() ?? '',
        status: json['status']?.toString() ?? 'open',
        priority: json['priority']?.toString() ?? '',
        dueAt: Lead._parseDate(json['dueAt']),
      );

  final String id;
  final String title;
  final String description;
  final String status;
  final String priority;
  final DateTime? dueAt;

  @override
  List<Object?> get props => [id, status];
}

class LeadFollowUp extends Equatable {
  const LeadFollowUp({
    required this.id,
    required this.title,
    this.notes = '',
    this.status = 'pending',
    this.dueAt,
    this.channel = '',
  });

  factory LeadFollowUp.fromJson(Map<String, dynamic> json) => LeadFollowUp(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        notes: json['notes']?.toString() ?? '',
        status: json['status']?.toString() ?? 'pending',
        dueAt: Lead._parseDate(json['dueAt']),
        channel: json['channel']?.toString() ?? '',
      );

  final String id;
  final String title;
  final String notes;
  final String status;
  final DateTime? dueAt;
  final String channel;

  @override
  List<Object?> get props => [id, status];
}

class TimelineEntry extends Equatable {
  const TimelineEntry({
    required this.id,
    required this.type,
    this.title = '',
    this.description = '',
    this.createdAt,
  });

  factory TimelineEntry.fromJson(Map<String, dynamic> json) {
    final payload = json['payload'];
    return TimelineEntry(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'event',
      title: json['title']?.toString() ??
          (payload is Map ? payload['title']?.toString() : null) ??
          json['type']?.toString() ??
          'Activity',
      description: json['description']?.toString() ??
          (payload is Map ? payload['note']?.toString() : null) ??
          '',
      createdAt: Lead._parseDate(json['createdAt']),
    );
  }

  final String id;
  final String type;
  final String title;
  final String description;
  final DateTime? createdAt;

  @override
  List<Object?> get props => [id];
}

class LeadDetailBundle extends Equatable {
  const LeadDetailBundle({
    required this.lead,
    this.timeline = const [],
    this.tasks = const [],
    this.followups = const [],
    this.notes = const [],
    this.attachments = const [],
  });

  factory LeadDetailBundle.fromJson(Map<String, dynamic> json) => LeadDetailBundle(
        lead: Lead.fromJson(Map<String, dynamic>.from(json['lead'] as Map? ?? {})),
        timeline: _list(json['timeline'], TimelineEntry.fromJson),
        tasks: _list(json['tasks'], LeadTask.fromJson),
        followups: _list(json['followups'], LeadFollowUp.fromJson),
        notes: _list(json['notes'], LeadNote.fromJson),
        attachments: _list(json['attachments'], LeadAttachment.fromJson),
      );

  static List<T> _list<T>(dynamic raw, T Function(Map<String, dynamic>) fromJson) {
    if (raw is! List) return [];
    return raw
        .map((e) => fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  final Lead lead;
  final List<TimelineEntry> timeline;
  final List<LeadTask> tasks;
  final List<LeadFollowUp> followups;
  final List<LeadNote> notes;
  final List<LeadAttachment> attachments;

  @override
  List<Object?> get props => [lead, timeline, tasks, followups, notes, attachments];

  Map<String, dynamic> toJson() => {
        'lead': lead.toJson(),
        'timeline': timeline
            .map((e) => {
                  'id': e.id,
                  'type': e.type,
                  'title': e.title,
                  'description': e.description,
                  if (e.createdAt != null)
                    'createdAt': e.createdAt!.toUtc().toIso8601String(),
                })
            .toList(),
        'tasks': tasks
            .map((t) => {
                  'id': t.id,
                  'title': t.title,
                  'description': t.description,
                  'status': t.status,
                  'priority': t.priority,
                  if (t.dueAt != null) 'dueAt': t.dueAt!.toUtc().toIso8601String(),
                })
            .toList(),
        'followups': followups
            .map((f) => {
                  'id': f.id,
                  'title': f.title,
                  'notes': f.notes,
                  'status': f.status,
                  'channel': f.channel,
                  if (f.dueAt != null) 'dueAt': f.dueAt!.toUtc().toIso8601String(),
                })
            .toList(),
        'notes': notes
            .map((n) => {
                  'id': n.id,
                  'note': n.note,
                  if (n.createdAt != null)
                    'createdAt': n.createdAt!.toUtc().toIso8601String(),
                })
            .toList(),
        'attachments': attachments
            .map((a) => {
                  'id': a.id,
                  'fileName': a.fileName,
                  'url': a.url,
                  'mimeType': a.mimeType,
                  'size': a.size,
                  if (a.createdAt != null)
                    'createdAt': a.createdAt!.toUtc().toIso8601String(),
                })
            .toList(),
      };
}

class PipelineItem extends Equatable {
  const PipelineItem({
    required this.id,
    required this.name,
    required this.status,
    this.company = '',
    this.phone = '',
    this.label = '',
    this.expectedValue = 0,
    this.owner = '',
    this.stage = '',
  });

  factory PipelineItem.fromJson(Map<String, dynamic> json) => PipelineItem(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? json['company']?.toString() ?? 'Lead',
        company: json['company']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        status: json['status']?.toString() ?? 'Contacted',
        label: json['label']?.toString() ?? '',
        expectedValue: (json['expectedValue'] as num?)?.toDouble() ?? 0,
        owner: json['owner']?.toString() ?? '',
        stage: json['stage']?.toString() ?? '',
      );

  final String id;
  final String name;
  final String company;
  final String phone;
  final String status;
  final String label;
  final double expectedValue;
  final String owner;
  final String stage;

  @override
  List<Object?> get props => [id, status];
}

class LeadsPage extends Equatable {
  const LeadsPage({
    required this.items,
    required this.page,
    required this.total,
    required this.pages,
    this.hasMore = false,
  });

  final List<Lead> items;
  final int page;
  final int total;
  final int pages;
  final bool hasMore;

  @override
  List<Object?> get props => [page, total, items.length];
}

/// CRM status + label filter constants
abstract final class LeadFilters {
  static const statuses = [
    'all',
    'New',
    'Contacted',
    'Qualified',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost',
  ];

  static const labels = ['all', 'Platinum', 'Hot', 'Warm', 'Cold'];

  static const pipelineStatuses = [
    'Contacted',
    'Qualified',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost',
  ];
}
