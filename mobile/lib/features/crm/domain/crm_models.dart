class CrmCustomer {
  const CrmCustomer({
    required this.id,
    required this.name,
    this.company,
    this.email,
    this.phone,
    this.status,
    this.territory,
    this.contacts = const [],
    this.activities = const [],
    this.subscriptions = const [],
    this.children = const [],
    this.leadId,
    this.opportunityId,
  });

  factory CrmCustomer.fromJson(Map<String, dynamic> json) => CrmCustomer(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'Customer',
        company: json['company']?.toString(),
        email: json['email']?.toString(),
        phone: json['phone']?.toString(),
        status: json['status']?.toString(),
        territory: json['territory']?.toString(),
        contacts: (json['contacts'] as List?)
                ?.map((e) => Map<String, dynamic>.from(e as Map))
                .toList() ??
            const [],
        activities: (json['activities'] as List?)
                ?.map((e) => Map<String, dynamic>.from(e as Map))
                .toList() ??
            const [],
        subscriptions: (json['subscriptions'] as List?)
                ?.map((e) => Map<String, dynamic>.from(e as Map))
                .toList() ??
            const [],
        children: (json['children'] as List?)
                ?.map((e) => Map<String, dynamic>.from(e as Map))
                .toList() ??
            const [],
        leadId: json['leadId']?.toString(),
        opportunityId: json['opportunityId']?.toString(),
      );

  final String id;
  final String name;
  final String? company;
  final String? email;
  final String? phone;
  final String? status;
  final String? territory;
  final List<Map<String, dynamic>> contacts;
  final List<Map<String, dynamic>> activities;
  final List<Map<String, dynamic>> subscriptions;
  final List<Map<String, dynamic>> children;
  final String? leadId;
  final String? opportunityId;

  String get subtitle => company?.isNotEmpty == true ? company! : (email ?? phone ?? '');
}

class CrmOpportunity {
  const CrmOpportunity({
    required this.id,
    required this.name,
    this.company,
    this.stage,
    this.status,
    this.expectedValue,
    this.leadId,
  });

  factory CrmOpportunity.fromJson(Map<String, dynamic> json) => CrmOpportunity(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? json['company']?.toString() ?? 'Opportunity',
        company: json['company']?.toString(),
        stage: json['stage']?.toString(),
        status: json['status']?.toString(),
        expectedValue: (json['expectedValue'] as num?)?.toDouble(),
        leadId: json['leadId']?.toString(),
      );

  final String id;
  final String name;
  final String? company;
  final String? stage;
  final String? status;
  final double? expectedValue;
  final String? leadId;
}

class CrmCampaign {
  const CrmCampaign({
    required this.id,
    required this.name,
    this.channel,
    this.status,
    this.scheduledAt,
    this.templateId,
  });

  factory CrmCampaign.fromJson(Map<String, dynamic> json) => CrmCampaign(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'Campaign',
        channel: json['channel']?.toString(),
        status: json['status']?.toString(),
        scheduledAt: json['scheduledAt']?.toString(),
        templateId: json['templateId']?.toString(),
      );

  final String id;
  final String name;
  final String? channel;
  final String? status;
  final String? scheduledAt;
  final String? templateId;
}

class CrmProposal {
  const CrmProposal({
    required this.id,
    required this.title,
    this.status,
    this.totalAmount,
    this.clientName,
  });

  factory CrmProposal.fromJson(Map<String, dynamic> json) => CrmProposal(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? json['name']?.toString() ?? 'Proposal',
        status: json['status']?.toString(),
        totalAmount: (json['totalAmount'] as num?)?.toDouble(),
        clientName: json['clientName']?.toString(),
      );

  final String id;
  final String title;
  final String? status;
  final double? totalAmount;
  final String? clientName;
}

class CrmInvoiceLineItem {
  const CrmInvoiceLineItem({
    required this.name,
    this.qty = 1,
    this.rate = 0,
    this.amount = 0,
  });

  factory CrmInvoiceLineItem.fromJson(Map<String, dynamic> json) => CrmInvoiceLineItem(
        name: json['name']?.toString() ?? 'Item',
        qty: (json['qty'] as num?)?.toInt() ?? 1,
        rate: (json['rate'] as num?)?.toDouble() ?? 0,
        amount: (json['amount'] as num?)?.toDouble() ?? 0,
      );

  final String name;
  final int qty;
  final double rate;
  final double amount;
}

class CrmInvoice {
  const CrmInvoice({
    required this.id,
    required this.invoiceNumber,
    this.clientName,
    this.company,
    this.totalAmount,
    this.status,
    this.gstAmount,
    this.subtotal,
    this.gstPercent,
    this.items = const [],
  });

  factory CrmInvoice.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List? ?? [];
    return CrmInvoice(
      id: json['id']?.toString() ?? _stringId(json['_id']),
      invoiceNumber: json['invoiceNumber']?.toString() ?? '—',
      clientName: json['clientName']?.toString(),
      company: json['company']?.toString(),
      totalAmount: (json['totalAmount'] as num?)?.toDouble(),
      status: json['status']?.toString(),
      gstAmount: (json['gstAmount'] as num?)?.toDouble(),
      subtotal: (json['subtotal'] as num?)?.toDouble(),
      gstPercent: (json['gstPercent'] as num?)?.toDouble(),
      items: rawItems
          .map((e) => CrmInvoiceLineItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }

  final String id;
  final String invoiceNumber;
  final String? clientName;
  final String? company;
  final double? totalAmount;
  final String? status;
  final double? gstAmount;
  final double? subtotal;
  final double? gstPercent;
  final List<CrmInvoiceLineItem> items;
}

String _stringId(dynamic value) {
  if (value == null) return '';
  if (value is Map) {
    final oid = value[r'$oid'] ?? value['oid'];
    if (oid != null) return oid.toString();
  }
  return value.toString();
}

class CrmReportExport {
  const CrmReportExport({
    required this.id,
    this.type,
    this.status,
    this.totalRows,
    this.fileSize,
    this.createdAt,
    this.exportType,
  });

  factory CrmReportExport.fromJson(Map<String, dynamic> json) => CrmReportExport(
        id: json['id']?.toString() ?? '',
        type: json['type']?.toString(),
        status: json['status']?.toString(),
        totalRows: json['totalRows'] as int?,
        fileSize: json['fileSize'] as int?,
        createdAt: json['createdAt']?.toString(),
        exportType: json['exportType']?.toString() ?? json['format']?.toString(),
      );

  final String id;
  final String? type;
  final String? status;
  final int? totalRows;
  final int? fileSize;
  final String? createdAt;
  final String? exportType;
}

class CrmTerritory {
  const CrmTerritory({
    required this.id,
    required this.name,
    this.region,
    this.manager,
    this.leadCount,
  });

  factory CrmTerritory.fromJson(Map<String, dynamic> json) => CrmTerritory(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'Territory',
        region: json['region']?.toString(),
        manager: json['manager']?.toString(),
        leadCount: (json['leadCount'] as num?)?.toInt(),
      );

  final String id;
  final String name;
  final String? region;
  final String? manager;
  final int? leadCount;
}

class CrmWhatsAppThread {
  const CrmWhatsAppThread({
    required this.id,
    required this.contact,
    this.preview,
    this.unread = false,
  });

  factory CrmWhatsAppThread.fromJson(Map<String, dynamic> json) => CrmWhatsAppThread(
        id: json['id']?.toString() ?? '',
        contact: json['contact']?.toString() ?? 'Contact',
        preview: json['preview']?.toString(),
        unread: json['unread'] == true,
      );

  final String id;
  final String contact;
  final String? preview;
  final bool unread;
}

class CrmActivity {
  const CrmActivity({
    required this.id,
    required this.title,
    this.type,
    this.detail,
    this.createdAt,
  });

  factory CrmActivity.fromJson(Map<String, dynamic> json) => CrmActivity(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? json['action']?.toString() ?? 'Activity',
        type: json['type']?.toString(),
        detail: json['detail']?.toString(),
        createdAt: json['createdAt']?.toString(),
      );

  final String id;
  final String title;
  final String? type;
  final String? detail;
  final String? createdAt;
}

class WhatsAppMessage {
  const WhatsAppMessage({
    required this.id,
    required this.body,
    required this.direction,
    this.createdAt,
  });

  factory WhatsAppMessage.fromJson(Map<String, dynamic> json) => WhatsAppMessage(
        id: json['id']?.toString() ?? '',
        body: json['body']?.toString() ?? '',
        direction: json['direction']?.toString() ?? 'outbound',
        createdAt: json['createdAt']?.toString(),
      );

  final String id;
  final String body;
  final String direction;
  final String? createdAt;

  bool get isOutbound => direction == 'outbound';
}
