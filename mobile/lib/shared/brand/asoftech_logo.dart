import 'package:flutter/material.dart';

import 'brand_assets.dart';

/// Horizontal AsoftechInsightz wordmark from bundled brand assets.
class AsoftechLogo extends StatelessWidget {
  const AsoftechLogo({
    super.key,
    this.height = 40,
    this.alignment = Alignment.center,
  });

  final double height;
  final Alignment alignment;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: Image.asset(
        BrandAssets.asoftechLogo,
        height: height,
        fit: BoxFit.contain,
        semanticLabel: 'AsoftechInsightz',
      ),
    );
  }
}
