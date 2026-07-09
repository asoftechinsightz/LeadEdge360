import { PLAN_FEATURES } from './plan-features';

export function canAccess(planCode, feature) {

  const features =
    PLAN_FEATURES[planCode] || [];

  return features.includes(feature);
}

export function requireFeature(
  subscription,
  feature
) {

  if (!subscription) {
    throw new Error(
      'Subscription Required'
    );
  }

  const allowed =
    canAccess(
      subscription.planCode,
      feature
    );

  if (!allowed) {
    throw new Error(
      'Upgrade Required'
    );
  }

  return true;
}
