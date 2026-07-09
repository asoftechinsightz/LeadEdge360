import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/locale/l10n_context.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../../retailedge360/data/retail_repository.dart';
import '../../../retailedge360/domain/models/retail_models.dart';
import '../../../retailedge360/presentation/providers/retail_providers.dart';
import '../providers/onboarding_providers.dart';
import '../providers/quick_onboarding_provider.dart';

class QuickOnboardingScreen extends ConsumerStatefulWidget {
  const QuickOnboardingScreen({super.key});

  @override
  ConsumerState<QuickOnboardingScreen> createState() => _QuickOnboardingScreenState();
}

class _QuickOnboardingScreenState extends ConsumerState<QuickOnboardingScreen> {
  late final PageController _pageController;
  final _shopNameCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _gstinCtrl = TextEditingController();
  final _upiCtrl = TextEditingController();
  var _scannerOpen = false;
  var _demoCheckingOut = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _shopNameCtrl.dispose();
    _cityCtrl.dispose();
    _phoneCtrl.dispose();
    _gstinCtrl.dispose();
    _upiCtrl.dispose();
    super.dispose();
  }

  Future<void> _onNext() async {
    final l10n = context.l10n;
    final notifier = ref.read(quickOnboardingProvider.notifier);
    final ok = await notifier.goNext();
    if (!mounted) return;
    if (!ok) {
      final st = ref.read(quickOnboardingProvider);
      final msg = st.error == 'validation'
          ? l10n.quickFieldRequired
          : l10n.quickSetupFailed(st.error ?? '');
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      return;
    }
    final step = ref.read(quickOnboardingProvider).step;
    await _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
    );
    if (step == 3) {
      await _loadDemoSku();
    }
  }

  Future<void> _loadDemoSku() async {
    ref.invalidate(retailInventoryProvider);
    ref.invalidate(retailKpisProvider);
    try {
      final items = await ref.read(retailInventoryProvider.future);
      if (items.isNotEmpty && mounted) {
        ref.read(quickOnboardingProvider.notifier).setDemoSku(items.first);
      }
    } catch (_) {
      /* inventory may load on step 4 retry */
    }
  }

  Future<void> _completeDemoSale() async {
    final l10n = context.l10n;
    final st = ref.read(quickOnboardingProvider);
    final sku = st.demoSku;
    if (sku == null || !st.demoInCart || _demoCheckingOut) return;

    setState(() => _demoCheckingOut = true);
    try {
      await ref.read(retailRepositoryProvider).checkout(
            items: [
              {
                'inventoryId': sku.id,
                'qty': 1,
                'unitPrice': sku.price,
              },
            ],
            paymentMethod: 'cash',
          );
      ref.read(quickOnboardingProvider.notifier).markDemoBillComplete();
      ref.invalidate(retailKpisProvider);
      ref.invalidate(retailSalesProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.billSuccess)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.quickSetupFailed('$e'))),
        );
      }
    } finally {
      if (mounted) setState(() => _demoCheckingOut = false);
    }
  }

  Future<void> _sendTestWhatsApp() async {
    final l10n = context.l10n;
    final st = ref.read(quickOnboardingProvider);
    final phone = st.phone.replaceAll(RegExp(r'\D'), '');
    final isHi = Localizations.localeOf(context).languageCode == 'hi';
    final total = st.demoSku?.price ?? 10;
    final msg = isHi
        ? 'RetailEdge360 टेस्ट बिल\n${st.shopName}\nकुल: ${formatRetailCurrency(total)}\nधन्यवाद!'
        : 'RetailEdge360 test bill\n${st.shopName}\nTotal: ${formatRetailCurrency(total)}\nThank you!';
    final uri = Uri.parse('https://wa.me/91$phone?text=${Uri.encodeComponent(msg)}');
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (launched) {
      ref.read(quickOnboardingProvider.notifier).markTestWaSent();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.quickSetupFailed('WhatsApp'))),
      );
    }
  }

  void _finish() {
    ref.invalidate(retailQuickSetupNeededProvider);
    ref.invalidate(onboardingProgressProvider);
    context.go('/home/retail?tab=pos');
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final st = ref.watch(quickOnboardingProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.quickSetupTitle),
        automaticallyImplyLeading: st.step > 0,
        leading: st.step > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () {
                  ref.read(quickOnboardingProvider.notifier).goBack();
                  _pageController.previousPage(
                    duration: const Duration(milliseconds: 280),
                    curve: Curves.easeOut,
                  );
                },
              )
            : null,
      ),
      body: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.quickSetupStepOf(st.step + 1, QuickOnboardingState.totalSteps),
                      style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: (st.step + 1) / QuickOnboardingState.totalSteps,
                      backgroundColor: AppColors.borderLight,
                      color: AppColors.retailOrange,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    _step1ShopInfo(context, st, l10n),
                    _step2Products(context, st, l10n),
                    _step3Payment(context, st, l10n),
                    _step4DemoBill(context, st, l10n),
                    _step5TestWa(context, st, l10n),
                  ],
                ),
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: st.isSubmitting
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                            const SizedBox(width: 12),
                            Text(l10n.quickSettingUp),
                          ],
                        )
                      : st.step < 4
                          ? PrimaryButton(
                              label: l10n.quickNext,
                              icon: Icons.arrow_forward,
                              onPressed: _onNext,
                            )
                          : PrimaryButton(
                              label: l10n.quickFinish,
                              icon: Icons.point_of_sale,
                              onPressed: _finish,
                            ),
                ),
              ),
            ],
          ),
          if (_scannerOpen) _barcodeScannerOverlay(context, l10n),
        ],
      ),
    );
  }

  Widget _step1ShopInfo(BuildContext context, QuickOnboardingState st, dynamic l10n) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(l10n.quickStep1Title, style: Theme.of(context).textTheme.headlineSmall),
        Text(l10n.quickStep1Hint, style: const TextStyle(color: AppColors.retailOrange)),
        const SizedBox(height: 8),
        Text(l10n.quickSetupSubtitle, style: const TextStyle(color: AppColors.slate500)),
        const SizedBox(height: 24),
        TextField(
          controller: _shopNameCtrl,
          decoration: InputDecoration(labelText: l10n.quickShopName),
          onChanged: ref.read(quickOnboardingProvider.notifier).setShopName,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _cityCtrl,
          decoration: InputDecoration(labelText: l10n.quickCity),
          onChanged: ref.read(quickOnboardingProvider.notifier).setCity,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _phoneCtrl,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(labelText: l10n.quickPhone),
          onChanged: ref.read(quickOnboardingProvider.notifier).setPhone,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _gstinCtrl,
          decoration: InputDecoration(labelText: l10n.quickGstin),
          onChanged: ref.read(quickOnboardingProvider.notifier).setGstin,
        ),
      ],
    );
  }

  Widget _step2Products(BuildContext context, QuickOnboardingState st, dynamic l10n) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(l10n.quickStep2Title, style: Theme.of(context).textTheme.headlineSmall),
        Text(l10n.quickStep2Hint, style: const TextStyle(color: AppColors.retailOrange)),
        const SizedBox(height: 24),
        GlassCard(
          onTap: () {
            ref.read(quickOnboardingProvider.notifier).selectBarcodeMode();
            setState(() => _scannerOpen = true);
          },
          child: Row(
            children: [
              const Icon(Icons.qr_code_scanner, color: AppColors.retailOrange, size: 36),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l10n.quickScanBarcodes, style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text(l10n.quickScanBarcodesSub, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
                    if (st.scannedBarcodes.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(
                          l10n.quickScannedCount(st.scannedBarcodes.length),
                          style: const TextStyle(color: AppColors.leadedgeGreen, fontWeight: FontWeight.w600),
                        ),
                      ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
        const SizedBox(height: 12),
        ...st.scannedBarcodes.map(
          (code) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GlassCard(
              child: ListTile(
                leading: const Icon(Icons.inventory_2_outlined),
                title: Text(code),
                trailing: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => ref.read(quickOnboardingProvider.notifier).removeBarcode(code),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        GlassCard(
          onTap: () => ref.read(quickOnboardingProvider.notifier).selectKiranaTemplate(),
          child: Row(
            children: [
              Icon(
                Icons.storefront,
                color: st.useKiranaTemplate ? AppColors.leadedgeGreen : AppColors.primaryBlue,
                size: 36,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l10n.quickKiranaTemplate, style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text(l10n.quickKiranaTemplateSub, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
                  ],
                ),
              ),
              if (st.useKiranaTemplate) const Icon(Icons.check_circle, color: AppColors.leadedgeGreen),
            ],
          ),
        ),
      ],
    );
  }

  Widget _step3Payment(BuildContext context, QuickOnboardingState st, dynamic l10n) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(l10n.quickStep3Title, style: Theme.of(context).textTheme.headlineSmall),
        Text(l10n.quickStep3Hint, style: const TextStyle(color: AppColors.retailOrange)),
        const SizedBox(height: 24),
        if (!st.cashOnly)
          TextField(
            controller: _upiCtrl,
            decoration: InputDecoration(
              labelText: l10n.quickUpiId,
              hintText: 'shop@upi',
            ),
            onChanged: ref.read(quickOnboardingProvider.notifier).setUpiId,
          ),
        if (!st.cashOnly) const SizedBox(height: 16),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(l10n.quickCashOnly),
          subtitle: Text(l10n.quickCashOnlySub),
          value: st.cashOnly,
          onChanged: ref.read(quickOnboardingProvider.notifier).setCashOnly,
        ),
      ],
    );
  }

  Widget _step4DemoBill(BuildContext context, QuickOnboardingState st, dynamic l10n) {
    final sku = st.demoSku;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(l10n.quickStep4Title, style: Theme.of(context).textTheme.headlineSmall),
        Text(l10n.quickStep4Hint, style: const TextStyle(color: AppColors.retailOrange)),
        const SizedBox(height: 8),
        Text(l10n.quickDemoIntro, style: const TextStyle(color: AppColors.slate500)),
        if (!st.demoBillComplete)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              l10n.quickStep4Required,
              style: const TextStyle(color: AppColors.error, fontSize: 12),
            ),
          ),
        const SizedBox(height: 24),
        if (sku == null)
          const Center(child: CircularProgressIndicator())
        else ...[
          GlassCard(
            child: ListTile(
              leading: const Icon(Icons.shopping_bag_outlined, color: AppColors.retailOrange),
              title: Text(sku.name),
              subtitle: Text('${sku.sku} · ${formatRetailCurrency(sku.price)}'),
              trailing: st.demoInCart
                  ? const Icon(Icons.check_circle, color: AppColors.leadedgeGreen)
                  : null,
            ),
          ),
          const SizedBox(height: 16),
          if (!st.demoInCart)
            PrimaryButton(
              label: l10n.quickAddToBill,
              icon: Icons.add_shopping_cart,
              onPressed: () => ref.read(quickOnboardingProvider.notifier).addDemoToCart(),
            )
          else if (!st.demoBillComplete)
            PrimaryButton(
              label: _demoCheckingOut ? l10n.processing : l10n.quickDemoComplete,
              icon: Icons.point_of_sale,
              isLoading: _demoCheckingOut,
              onPressed: _completeDemoSale,
            )
          else
            GlassCard(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: AppColors.leadedgeGreen),
                    const SizedBox(width: 12),
                    Expanded(child: Text(l10n.billSuccess, style: const TextStyle(fontWeight: FontWeight.w600))),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 12),
          Text(
            '${l10n.total}: ${formatRetailCurrency(st.demoInCart ? sku.price : 0)}',
            style: Theme.of(context).textTheme.titleLarge,
          ),
        ],
      ],
    );
  }

  Widget _step5TestWa(BuildContext context, QuickOnboardingState st, dynamic l10n) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(l10n.quickStep5Title, style: Theme.of(context).textTheme.headlineSmall),
        Text(l10n.quickStep5Hint, style: const TextStyle(color: AppColors.retailOrange)),
        const SizedBox(height: 8),
        Text(l10n.quickTestWaIntro, style: const TextStyle(color: AppColors.slate500)),
        const SizedBox(height: 24),
        GlassCard(
          child: ListTile(
            leading: const Icon(Icons.phone, color: AppColors.retailOrange),
            title: Text(st.phone),
            subtitle: Text(st.shopName),
          ),
        ),
        const SizedBox(height: 20),
        PrimaryButton(
          label: l10n.quickSendTestBill,
          icon: Icons.chat_outlined,
          onPressed: _sendTestWhatsApp,
        ),
        if (st.testWaSent) ...[
          const SizedBox(height: 16),
          Text(
            l10n.billSuccess,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.leadedgeGreen, fontWeight: FontWeight.w600),
          ),
        ],
      ],
    );
  }

  Widget _barcodeScannerOverlay(BuildContext context, dynamic l10n) {
    return Positioned.fill(
      child: Material(
        color: Colors.black,
        child: Column(
          children: [
            AppBar(
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              title: Text(l10n.scanSku),
              leading: IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => setState(() => _scannerOpen = false),
              ),
            ),
            Expanded(
              child: MobileScanner(
                onDetect: (capture) {
                  if (capture.barcodes.isEmpty) return;
                  final code = capture.barcodes.first.rawValue;
                  if (code == null || code.isEmpty) return;
                  ref.read(quickOnboardingProvider.notifier).addBarcode(code);
                  setState(() => _scannerOpen = false);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
