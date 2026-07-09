import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'

export async function createEmailTemplate(
  orgId,
  payload = {}
) {

  const db = await getDb()

  const template = {
    id: randomUUID(),
    orgId,

    name:
      payload.name || 'Untitled Template',

    subject:
      payload.subject || '',

    body:
      payload.body || '',

    status:
      payload.status || 'active',

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  }

  await db.collection('email_templates')
    .insertOne(template)

  return {
    success: true,
    template
  }
}

export async function listEmailTemplates(
  orgId,
  page = 1,
  limit = 20
) {

  const db = await getDb()

  page =
    Math.max(
      parseInt(page || 1, 10),
      1
    )

  limit =
    Math.min(
      Math.max(
        parseInt(limit || 20, 10),
        1
      ),
      100
    )

  const skip =
    (page - 1) * limit

  const filter = { orgId }

  const [items, total] =
    await Promise.all([

      db.collection('email_templates')
        .find(
          filter,
          {
            projection: {
              _id: 0
            }
          }
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limit)
        .toArray(),

      db.collection('email_templates')
        .countDocuments(filter)

    ])

  return {
    success: true,
    page,
    limit,
    total,
    pages:
      Math.ceil(total / limit),
    items
  }
}

export async function getEmailTemplate(
  orgId,
  templateId
) {

  const db = await getDb()

  const template =
    await db.collection('email_templates')
      .findOne(
        {
          id: templateId,
          orgId
        },
        {
          projection: {
            _id: 0
          }
        }
      )

  return {
    success: true,
    template
  }
}

export async function updateEmailTemplate(
  orgId,
  templateId,
  payload = {}
) {

  const db = await getDb()

  await db.collection('email_templates')
    .updateOne(
      {
        id: templateId,
        orgId
      },
      {
        $set: {
          ...payload,
          updatedAt:
            new Date().toISOString()
        }
      }
    )

  const template =
    await db.collection('email_templates')
      .findOne(
        {
          id: templateId,
          orgId
        },
        {
          projection: {
            _id: 0
          }
        }
      )

  return {
    success: true,
    template
  }
}

export async function deleteEmailTemplate(
  orgId,
  templateId
) {

  const db = await getDb()

  const result =
    await db.collection('email_templates')
      .deleteOne({
        id: templateId,
        orgId
      })

  return {
    success: true,
    deleted:
      result.deletedCount > 0
  }
}
