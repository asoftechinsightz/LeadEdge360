import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'brand_assets.dart';

/// Product wordmark (LeadEdge360 / RetailEdge360) from bundled SVG assets.
class ProductBrandLogo extends StatelessWidget {
  const ProductBrandLogo({
    super.key,
    required this.product,
    this.height = 28,
    this.compact = false,
  });

  final String product;
  final double height;
  /// Use icon-only mark (fits app bars).
  final bool compact;

  bool get _isLeadEdge => product == 'leadedge360';

  String get _asset =>
      compact
          ? (_isLeadEdge ? BrandAssets.leadedgeIcon : BrandAssets.retailedgeIcon)
          : (_isLeadEdge ? BrandAssets.leadedgeLogo : BrandAssets.retailedgeLogo);

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      _asset,
      height: height,
      fit: BoxFit.contain,
      semanticsLabel: _isLeadEdge ? 'LeadEdge360' : 'RetailEdge360',
    );
  }
}
