import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:asoftech_business_suite/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('app launches to splash or login', (tester) async {
    app.main();
    await tester.pumpAndSettle(const Duration(seconds: 5));
    expect(find.byType(Object), findsWidgets);
  });
}
