import 'package:flutter/material.dart';

import 'product_brand_logo.dart';

/// Compact product title for app bars — uses SVG wordmark to avoid truncation.
class ProductBrandTitle extends StatelessWidget {
  const ProductBrandTitle({
    super.key,
    required this.product,
    this.compact = true,
  });

  final String product;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Align(
        alignment: Alignment.centerLeft,
        child: ProductBrandLogo(product: product, height: 26, compact: true),
      );
    }

    return ProductBrandLogo(product: product, height: 32, compact: false);
  }
}
