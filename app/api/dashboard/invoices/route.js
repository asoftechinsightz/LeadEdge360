import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic='force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { requirePlan } from '@/lib/billing/require-plan'

export async function GET(req){

 const { orgId } = await guardCrmRequest(req)

 await requirePlan(orgId,['GROWTH','PRO'])

 const db = await getDb()

 const stats =
   await db.collection('invoices')
   .aggregate([
     {
       $match:{
         orgId
       }
     },
     {
       $group:{
         _id:'$status',
         count:{ $sum:1 },
         amount:{ $sum:'$totalAmount' }
       }
     }
   ])
   .toArray()

 return NextResponse.json({
   success:true,
   stats
 })
}
