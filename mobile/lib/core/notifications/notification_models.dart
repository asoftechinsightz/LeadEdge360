import 'package:equatable/equatable.dart';

class AppNotification extends Equatable {
  const AppNotification({
    required this.id,
    this.title = '',
    this.body = '',
    this.type = '',
    this.read = false,
    this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? json['subject']?.toString() ?? 'Notification',
        body: json['body']?.toString() ?? json['message']?.toString() ?? '',
        type: json['type']?.toString() ?? '',
        read: json['readAt'] != null || json['status']?.toString() == 'read',
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      );

  final String id;
  final String title;
  final String body;
  final String type;
  final bool read;
  final DateTime? createdAt;

  @override
  List<Object?> get props => [id, read];
}

class NotificationsPage extends Equatable {
  const NotificationsPage({required this.items, required this.unread});

  final List<AppNotification> items;
  final int unread;

  @override
  List<Object?> get props => [items.length, unread];
}
