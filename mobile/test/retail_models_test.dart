import 'package:asoftech_business_suite/features/retailedge360/domain/models/retail_models.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('RetailSku.fromJson maps inventory row', () {
    final sku = RetailSku.fromJson({
      'id': 'inv-1',
      'name': 'Amul Milk 1L',
      'sku': 'AMUL-1L',
      'category': 'dairy',
      'price': 62,
      'stock': 120,
      'store': 'Default Store',
      'predictedShelfDays': 4,
      'risk': 'High',
      'recommendation': 'Mark down 15%',
    });
    expect(sku.name, 'Amul Milk 1L');
    expect(sku.stock, 120);
    expect(sku.risk, 'High');
    expect(sku.inventoryValue, 62 * 120);
  });

  test('RetailKpis.fromJson parses dashboard metrics', () {
    final kpis = RetailKpis.fromJson({
      'total': 42,
      'highRisk': 5,
      'inventoryValue': 125000,
      'atRiskValue': 18000,
      'savedSoFar': 11700,
    });
    expect(kpis.total, 42);
    expect(kpis.highRisk, 5);
    expect(kpis.savedSoFar, 11700);
  });

  test('formatRetailCurrency uses rupee symbol', () {
    expect(formatRetailCurrency(125000), contains('₹'));
  });
}
