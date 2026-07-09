import '../config/app_config.dart';
import '../storage/hive_boxes.dart';
import '../../features/retailedge360/domain/models/retail_models.dart';

/// Local Hive cache of retail SKUs for offline barcode / SKU lookup.
class RetailSkuCache {
  static const _mapKey = AppConfig.keyRetailSkuCache;

  Map<String, dynamic> _readMap() {
    final raw = HiveBoxes.cache.get(_mapKey);
    if (raw is Map) {
      return Map<String, dynamic>.from(raw);
    }
    return {};
  }

  Future<void> saveAll(Iterable<RetailSku> skus) async {
    final map = _readMap();
    for (final sku in skus) {
      map[sku.id] = _skuToJson(sku);
      if (sku.sku.isNotEmpty) {
        map['sku:${sku.sku.toLowerCase()}'] = sku.id;
      }
    }
    await HiveBoxes.cache.put(_mapKey, map);
  }

  Future<void> put(RetailSku sku) => saveAll([sku]);

  RetailSku? findByCode(String code) {
    final trimmed = code.trim();
    if (trimmed.isEmpty) return null;
    final map = _readMap();

    final byId = map[trimmed];
    if (byId is Map) {
      return RetailSku.fromJson(Map<String, dynamic>.from(byId));
    }

    final idRef = map['sku:${trimmed.toLowerCase()}'];
    if (idRef is String) {
      final raw = map[idRef];
      if (raw is Map) {
        return RetailSku.fromJson(Map<String, dynamic>.from(raw));
      }
    }

    for (final entry in map.entries) {
      if (entry.key.startsWith('sku:')) continue;
      if (entry.value is! Map) continue;
      final sku = RetailSku.fromJson(Map<String, dynamic>.from(entry.value as Map));
      if (sku.sku.toLowerCase() == trimmed.toLowerCase() ||
          sku.id == trimmed) {
        return sku;
      }
    }
    return null;
  }

  List<RetailSku> getAll() {
    final map = _readMap();
    final items = <RetailSku>[];
    for (final entry in map.entries) {
      if (entry.key.startsWith('sku:')) continue;
      if (entry.value is Map) {
        items.add(RetailSku.fromJson(Map<String, dynamic>.from(entry.value as Map)));
      }
    }
    return items;
  }

  Map<String, dynamic> _skuToJson(RetailSku sku) => {
        'id': sku.id,
        'name': sku.name,
        'sku': sku.sku,
        'category': sku.category,
        'price': sku.price,
        'stock': sku.stock,
        'store': sku.store,
        'daysOnShelf': sku.daysOnShelf,
        'predictedShelfDays': sku.predictedShelfDays,
        'risk': sku.risk,
        'recommendation': sku.recommendation,
        'engine': sku.engine,
        'expiryDate': sku.expiryDate,
      };
}
