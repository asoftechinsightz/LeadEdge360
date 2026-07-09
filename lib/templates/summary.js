import { getDb } from '@/lib/mongo'

export async function getEmailTemplateSummary(
  orgId
) {

  const db = await getDb()

  const [
    totalTemplates,
    activeTemplates,
    inactiveTemplates
  ] = await Promise.all([

    db.collection('email_templates')
      .countDocuments({ orgId }),

    db.collection('email_templates')
      .countDocuments({
        orgId,
        status: 'active'
      }),

    db.collection('email_templates')
      .countDocuments({
        orgId,
        status: 'inactive'
      })
  ])

  return {
    success: true,
    totalTemplates,
    activeTemplates,
    inactiveTemplates
  }
}
