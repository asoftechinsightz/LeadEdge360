const MARKETING_INDEXES = [
  { collection: 'marketing_content', name: 'marketing_content_org_status' },
  { collection: 'marketing_calendar', name: 'marketing_calendar_org_date' },
  { collection: 'marketing_publish_queue', name: 'marketing_publish_queue_org_status' },
]

export async function down(db) {
  for (const { collection, name } of MARKETING_INDEXES) {
    try {
      await db.collection(collection).dropIndex(name)
      console.log(`  dropped ${collection}.${name}`)
    } catch {
      /* index may not exist */
    }
  }
}
