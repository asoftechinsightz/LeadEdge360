/**
 * MongoDB Shell init — paste into mongosh or run:
 *   mongosh "mongodb://127.0.0.1:27017" --file database/mongosh-init.js
 *
 * Replace db name below if needed. Password hash must be created via
 * node scripts/mongo-bootstrap.mjs (uses bcrypt). This file covers indexes + structure only.
 */

const DB_NAME = 'asoftech'
const db = db.getSiblingDB(DB_NAME)

print('Creating business_cards indexes…')

db.business_cards.createIndex(
  { orgId: 1, id: 1 },
  { name: 'business_cards_orgId_id', background: true },
)
db.business_cards.createIndex(
  { slug: 1 },
  { name: 'business_cards_slug_unique', unique: true, background: true },
)
db.business_cards.createIndex(
  { orgId: 1, updatedAt: -1 },
  { name: 'business_cards_orgId_updatedAt', background: true },
)

print('business_cards indexes OK')

// Example document shape (do not insert without unique id/slug)
print(`
Collection: business_cards
{
  id: "<uuid>",
  orgId: "demo-org",
  slug: "your-business-slug",       // globally unique
  published: true,
  profile: {
    businessName, tagline, description,
    phone, email, whatsapp, website,
    address, city, state, pincode,
    logoUrl, coverUrl
  },
  socialLinks: { google, facebook, instagram, linkedin },
  theme: { primaryColor: "#FF8A3D", layout: "classic" },
  stats: { views: 0, clicks: 0 },
  createdAt, updatedAt, createdBy, updatedBy
}
`)

print('For full seed (admin user + subscription + sample card), run:')
print('  node scripts/mongo-bootstrap.mjs')
