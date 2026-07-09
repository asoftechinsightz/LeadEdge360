import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/leadedge360/data/leads_repository.dart';
import '../../features/retailedge360/data/retail_repository.dart';

class DemoSetupResult {
  const DemoSetupResult({required this.messages, this.error});

  final List<String> messages;
  final String? error;

  bool get ok => error == null;
}

class DemoSetupService {
  const DemoSetupService();

  static const _demoSkus = [
    (
      name: 'Organic Basmati Rice 5kg',
      sku: 'DEMO-R001',
      category: 'grocery',
      price: 649.0,
      stock: 120,
      daysOnShelf: 14,
    ),
    (
      name: 'Cold-Pressed Sunflower Oil 1L',
      sku: 'DEMO-R002',
      category: 'grocery',
      price: 289.0,
      stock: 85,
      daysOnShelf: 45,
    ),
    (
      name: 'Premium Green Tea 100 bags',
      sku: 'DEMO-R003',
      category: 'beverages',
      price: 399.0,
      stock: 60,
      daysOnShelf: 90,
    ),
  ];

  Future<DemoSetupResult> seed({
    required LeadsRepository leadsRepo,
    required RetailRepository retailRepo,
  }) async {
    final messages = <String>[];

    try {
      final inventory = await retailRepo.fetchInventory();
      if (inventory.isEmpty) {
        for (final item in _demoSkus) {
          await retailRepo.createSku(
            name: item.name,
            sku: item.sku,
            category: item.category,
            price: item.price,
            stock: item.stock,
            daysOnShelf: item.daysOnShelf,
          );
        }
        messages.add('Added ${_demoSkus.length} demo retail SKUs');
      } else {
        messages.add('Retail inventory already has ${inventory.length} SKUs — skipped');
      }

      final leadsPage = await leadsRepo.fetchLeads(const LeadsQuery(limit: 20));
      final pipeline = await leadsRepo.fetchPipeline();

      if (pipeline.isEmpty && leadsPage.items.isNotEmpty) {
        final candidate = leadsPage.items.firstWhere(
          (l) => l.status == 'New',
          orElse: () => leadsPage.items.first,
        );
        if (candidate.status != 'Contacted') {
          await leadsRepo.updateLeadStatus(candidate.id, 'Contacted');
          messages.add('Moved "${candidate.name}" to Contacted for pipeline demo');
        } else {
          messages.add('A lead is already in Contacted stage');
        }
      } else if (pipeline.isNotEmpty) {
        messages.add('Pipeline already has ${pipeline.length} opportunities — skipped');
      } else {
        messages.add('No leads found — create a lead first for pipeline demo');
      }

      return DemoSetupResult(messages: messages);
    } catch (e) {
      return DemoSetupResult(messages: messages, error: e.toString());
    }
  }
}

final demoSetupServiceProvider = Provider<DemoSetupService>((ref) => const DemoSetupService());
