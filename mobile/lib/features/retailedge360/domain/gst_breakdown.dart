/// GST breakdown for retail POS (default 5% = 2.5% CGST + 2.5% SGST).
class GstBreakdown {
  const GstBreakdown({
    required this.subtotal,
    required this.cgst,
    required this.sgst,
    required this.gstRate,
    required this.total,
  });

  factory GstBreakdown.fromSubtotal(double subtotal, {double gstRate = 5}) {
    final half = gstRate / 2;
    final cgst = (subtotal * half / 100 * 100).roundToDouble() / 100;
    final sgst = cgst;
    return GstBreakdown(
      subtotal: subtotal,
      cgst: cgst,
      sgst: sgst,
      gstRate: gstRate,
      total: ((subtotal + cgst + sgst) * 100).roundToDouble() / 100,
    );
  }

  final double subtotal;
  final double cgst;
  final double sgst;
  final double gstRate;
  final double total;

  double get halfRate => gstRate / 2;
}
