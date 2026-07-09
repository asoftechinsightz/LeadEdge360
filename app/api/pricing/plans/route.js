export const dynamic='force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'

export async function GET(){

 const db = await getDb()

 const plans =
  await db.collection('subscription_plans')
   .find({active:true})
   .sort({subscriptionAmount:1})
   .toArray()

 return NextResponse.json({
  success:true,
  plans
 })
}
