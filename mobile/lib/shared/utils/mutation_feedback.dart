import 'package:flutter/material.dart';

import '../../features/leadedge360/data/leads_repository.dart';

void showMutationSnackBar(BuildContext context, MutationResult result) {
  if (!context.mounted || !result.queued) return;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(result.message ?? 'Saved offline — will sync when online')),
  );
}
