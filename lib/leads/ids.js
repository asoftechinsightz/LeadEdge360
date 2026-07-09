/** Client-safe lead id helpers (no MongoDB imports). */

export function getLeadLinkId(lead) {
  return lead?.id || (lead?._id ? String(lead._id) : null)
}
