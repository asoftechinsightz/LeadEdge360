export { AppShell } from './AppShell';
export type { AppShellProps } from './AppShell';
export { Sidebar } from './Sidebar';
export { SuiteHeader } from './SuiteHeader';
export { Breadcrumbs } from './Breadcrumbs';
export { MobileNav } from './MobileNav';
export { ProductSwitcher } from './ProductSwitcher';
export { GlobalSearch } from './GlobalSearch';
export { NotificationBell } from './NotificationBell';
export { UserMenu, UserMenuSignIn } from './UserMenu';
export { SuiteAuthProvider, useSuiteAuth } from './SuiteAuthContext';
export type { SuiteUser } from './SuiteAuthContext';
export { SUITE_NAV, SUITE_ROUTES, SUITE_PRODUCTS, ROUTE_LABELS, isSuitePath, LEADEDGE_NAV_GROUPS, isLeadEdgePath, getNavGroupsForPath } from './nav-config';
export type { SuiteNavItem, SuiteRoute } from './nav-config';
export { suiteFetch, authHeaders, getStoredToken } from './suite-api';
export {
  SIGN_IN_PATH,
  SUITE_AUTH_GUARD_PATHS,
  buildSignInUrl,
  redirectToSignIn,
  normalizeAppPath,
  resolveReturnUrl,
} from './auth-routes';
export { default as SuiteRouteLayout } from './SuiteRouteLayout';
export { ProposalTable } from './ProposalTable';
export { CampaignTable } from './CampaignTable';
export { AnalyticsDashboard } from './AnalyticsDashboard';
export { SettingsModule } from './SettingsModule';
