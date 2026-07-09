import '../config/app_config.dart';
import '../storage/hive_boxes.dart';
import '../../features/leadedge360/data/leads_repository.dart';
import '../../features/leadedge360/domain/models/lead_models.dart';

class LeadsCache {
  Map<String, Map<String, dynamic>> _leadsMap() {
    final raw = HiveBoxes.cache.get(AppConfig.keyCachedLeads);
    if (raw is! Map) return {};
    return raw.map(
      (k, v) => MapEntry(k.toString(), Map<String, dynamic>.from(v as Map)),
    );
  }

  Map<String, Map<String, dynamic>> _detailsMap() {
    final raw = HiveBoxes.cache.get(AppConfig.keyCachedLeadDetails);
    if (raw is! Map) return {};
    return raw.map(
      (k, v) => MapEntry(k.toString(), Map<String, dynamic>.from(v as Map)),
    );
  }

  List<Lead> getAllLeads() {
    return _leadsMap()
        .values
        .map((j) => Lead.fromJson(j))
        .toList()
      ..sort((a, b) => b.score.compareTo(a.score));
  }

  DateTime? lastSyncAt() {
    final raw = HiveBoxes.cache.get(AppConfig.keyLastSyncAt) as String?;
    return raw == null ? null : DateTime.tryParse(raw);
  }

  Future<void> setLastSyncAt(DateTime at) async {
    await HiveBoxes.cache.put(AppConfig.keyLastSyncAt, at.toUtc().toIso8601String());
  }

  Future<void> mergeLeads(List<Lead> leads) async {
    if (leads.isEmpty) return;
    final map = _leadsMap();
    for (final lead in leads) {
      final existing = map[lead.id];
      if (existing == null || _isNewer(lead.updatedAt, existing['updatedAt'])) {
        map[lead.id] = lead.toJson();
      }
    }
    await HiveBoxes.cache.put(AppConfig.keyCachedLeads, map);
  }

  Future<void> putLead(Lead lead) async {
    final map = _leadsMap();
    map[lead.id] = lead.toJson();
    await HiveBoxes.cache.put(AppConfig.keyCachedLeads, map);
  }

  Future<void> replaceLeadId(String fromId, String toId) async {
    final map = _leadsMap();
    final json = map.remove(fromId);
    if (json != null) {
      json['id'] = toId;
      map[toId] = json;
      await HiveBoxes.cache.put(AppConfig.keyCachedLeads, map);
    }

    final details = _detailsMap();
    final bundle = details.remove(fromId);
    if (bundle != null) {
      final leadJson = Map<String, dynamic>.from(bundle['lead'] as Map? ?? {});
      leadJson['id'] = toId;
      bundle['lead'] = leadJson;
      details[toId] = bundle;
      await HiveBoxes.cache.put(AppConfig.keyCachedLeadDetails, details);
    }
  }

  Lead? getLead(String id) {
    final json = _leadsMap()[id];
    return json == null ? null : Lead.fromJson(json);
  }

  Future<void> cacheDetail(LeadDetailBundle bundle) async {
    final map = _detailsMap();
    map[bundle.lead.id] = bundle.toJson();
    await HiveBoxes.cache.put(AppConfig.keyCachedLeadDetails, map);
    await putLead(bundle.lead);
  }

  LeadDetailBundle? getDetail(String leadId) {
    final json = _detailsMap()[leadId];
    if (json == null) return null;
    return LeadDetailBundle.fromJson(json);
  }

  Future<void> patchLeadStatus(String leadId, String status) async {
    final map = _leadsMap();
    final json = map[leadId];
    if (json == null) return;
    json['status'] = status;
    json['updatedAt'] = DateTime.now().toUtc().toIso8601String();
    map[leadId] = json;
    await HiveBoxes.cache.put(AppConfig.keyCachedLeads, map);

    final details = _detailsMap();
    final bundle = details[leadId];
    if (bundle != null) {
      final leadJson = Map<String, dynamic>.from(bundle['lead'] as Map? ?? {});
      leadJson['status'] = status;
      leadJson['updatedAt'] = json['updatedAt'];
      bundle['lead'] = leadJson;
      details[leadId] = bundle;
      await HiveBoxes.cache.put(AppConfig.keyCachedLeadDetails, details);
    }
  }

  LeadsPage pageFromCache(LeadsQuery query) {
    var list = getAllLeads();

    if (query.status != 'all') {
      list = list.where((l) => l.status == query.status).toList();
    }
    if (query.label != 'all') {
      list = list.where((l) => l.label == query.label).toList();
    }
    final q = query.search.trim().toLowerCase();
    if (q.isNotEmpty) {
      list = list.where((l) {
        return l.name.toLowerCase().contains(q) ||
            l.company.toLowerCase().contains(q) ||
            l.phone.contains(q) ||
            l.email.toLowerCase().contains(q);
      }).toList();
    }

    final total = list.length;
    final pages = total == 0 ? 1 : (total / query.limit).ceil();
    final start = (query.page - 1) * query.limit;
    final end = (start + query.limit).clamp(0, total);
    final slice = start < total ? list.sublist(start, end) : <Lead>[];

    return LeadsPage(
      items: slice,
      page: query.page,
      total: total,
      pages: pages,
      hasMore: query.page < pages,
    );
  }

  Future<void> cacheBootstrap(Map<String, dynamic> bootstrap) async {
    await HiveBoxes.cache.put(AppConfig.keyCachedBootstrap, bootstrap);
    final recent = bootstrap['recentLeads'] as List? ?? [];
    final leads = recent
        .map((e) => Lead.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    await mergeLeads(leads);
  }

  Map<String, dynamic>? getBootstrap() {
    final raw = HiveBoxes.cache.get(AppConfig.keyCachedBootstrap);
    if (raw is Map) return Map<String, dynamic>.from(raw);
    return null;
  }

  bool _isNewer(DateTime? incoming, dynamic existingRaw) {
    if (incoming == null) return true;
    final existing = DateTime.tryParse(existingRaw?.toString() ?? '');
    if (existing == null) return true;
    return !incoming.isBefore(existing);
  }
}
