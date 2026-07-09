# Enterprise Website Audit — AsoftechInsightz

**Date:** 2026-06-22  
**Scope:** Public marketing pages (brand identity preserved — no logo/color changes)

---

## Executive Summary

The site had strong technical foundations (design tokens, enterprise dark theme, product screenshots) but **pages were disconnected** — most used the same thin pattern: hero + card grid + CTA. Missing unified storytelling, ROI framing, FAQs, and industry depth.

---

## Page-by-Page Gaps

| Page | Issues | Fix |
|------|--------|-----|
| **/** Home | Strong sections but weak "who we help / why trust" narrative block | Add trust narrative + align section order |
| **/industries** | Simple 3-line cards; no ROI, workflows, integrations per vertical | Full industry profiles via `EnterprisePageTemplate` |
| **/solutions** | Feature lists, not business outcomes | AI solution pillars + product mapping + outcomes |
| **/about** | Thin company story; missing vision, values, AI vision, careers | Full company page structure |
| **/customers** | 3 case studies only; no before/after, journey, enterprise trust | Customer success hub with metrics + lifecycle |
| **/resources** | 4 links only; missing whitepapers, webinars, guides taxonomy | Resource categories + featured content |
| **/services** | IT-services tone (legacy) | Redirect content to solutions positioning |
| **/products** | Generic cards | Link to product marketing pages |
| **/pricing** | Single tier list | Product-aware CTAs (done previously) |
| **/contact** | Form only | CRM lead capture (done previously) |

---

## Cross-Cutting Issues

1. **Inconsistent page anatomy** — no shared 12-section framework  
2. **Weak CTA hierarchy** — Book Demo not primary on all pages  
3. **Missing FAQ** on marketing pages  
4. **SEO** — partial metadata; now standardized per page  
5. **Empty hero feel** — heroes lacked metrics, product context, visuals  

---

## Implementation Approach

- **Reusable:** `components/enterprise/EnterprisePageTemplate.jsx`  
- **Content:** `lib/enterprise-pages.js` (single source per page type)  
- **Brand:** `BrandLogo`, `BrandWordmark`, tokens unchanged  
- **Visuals:** Existing PNG dashboards, glass cards, Framer Motion  

---

## Success Criteria Met

- [x] Unified design system across marketing pages  
- [x] Preserve AsoftechInsightz logo and brand colors  
- [x] LeadEdge360 + RetailEdge360 on every major page  
- [x] Enterprise-grade content (challenges → solutions → outcomes)  
- [x] FAQ + Security + CTA on template pages  
