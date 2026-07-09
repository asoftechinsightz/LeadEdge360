import { guardProposalRequest, crmError } from '@/lib/api/route-guards'
export const dynamic='force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'

export async function GET(req){

 const { orgId } = await guardProposalRequest(req)

 const db = await getDb()

 const stats =
   await db.collection('proposals')
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
