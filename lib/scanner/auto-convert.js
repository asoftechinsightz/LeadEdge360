import { randomUUID } from 'crypto'
import { convertScannerResult } from './convert'
import { getDb } from '@/lib/mongo'

export async function autoConvertScannerResult(
  orgId,
  resultId
) {

  const converted =
    await convertScannerResult(
      orgId,
      resultId
    )

  const leadId =
    converted.leadId

  const db =
    await getDb()

  const assignedTo =
    'Sales Team'

  let duplicateAssignment = false
  let duplicateFollowup = false
  let duplicateTask = false
  let duplicateTimeline = false

  let assignmentId
  let followupId
  let taskId

  const existingAssignment =
    await db.collection('lead_assignments')
      .findOne({
        orgId,
        leadId
      })

  if (existingAssignment) {

    duplicateAssignment = true
    assignmentId =
      existingAssignment.id

  } else {

    assignmentId =
      randomUUID()

    await db.collection('lead_assignments')
      .insertOne({
        id: assignmentId,
        orgId,
        leadId,
        assignedTo,
        createdAt: new Date()
      })
  }

  await db.collection('leads')
    .updateOne(
      {
        id: leadId,
        orgId
      },
      {
        $set: {
          assignedTo
        }
      }
    )

  const existingFollowup =
    await db.collection('follow_ups')
      .findOne({
        orgId,
        leadId,
        status: 'pending'
      })

  if (existingFollowup) {

    duplicateFollowup = true
    followupId =
      existingFollowup.id

  } else {

    followupId =
      randomUUID()

    await db.collection('follow_ups')
      .insertOne({
        id: followupId,
        orgId,
        leadId,
        title: 'Initial Contact',
        dueAt: new Date(
          Date.now() + 86400000
        ).toISOString(),
        status: 'pending',
        createdAt: new Date()
      })
  }

  const existingTask =
    await db.collection('lead_tasks')
      .findOne({
        orgId,
        leadId,
        status: 'open'
      })

  if (existingTask) {

    duplicateTask = true
    taskId =
      existingTask.id

  } else {

    taskId =
      randomUUID()

    await db.collection('lead_tasks')
      .insertOne({
        id: taskId,
        orgId,
        leadId,
        title: 'Call New Lead',
        description:
          'Contact scanner generated lead',
        priority: 'high',
        status: 'open',
        createdAt: new Date()
      })
  }

  const existingTimeline =
    await db.collection('lead_timeline')
      .findOne({
        orgId,
        leadId,
        type: 'auto_conversion'
      })

  if (existingTimeline) {

    duplicateTimeline = true

  } else {

    await db.collection('lead_timeline')
      .insertOne({
        id: randomUUID(),
        orgId,
        leadId,
        type: 'auto_conversion',
        payload: {
          assignedTo
        },
        createdAt: new Date()
      })
  }

  return {
    success: true,
    leadId,
    assignmentId,
    followupId,
    taskId,
    assignedTo,
    duplicateLead:
      !!converted.duplicate,
    duplicateAssignment,
    duplicateFollowup,
    duplicateTask,
    duplicateTimeline
  }
}
