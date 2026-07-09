import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic='force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { getRazorpay } from '@/lib/razorpay'

export async function POST(req){

 const { orgId } = await guardCrmRequest(req)

 const db = await getDb()

 const body = await req.json()

 const plan =
   await db.collection('subscription_plans')
   .findOne({code:body.planCode})

 if(!plan){
   return NextResponse.json(
    {success:false,error:'PLAN_NOT_FOUND'},
    {status:404}
   )
 }

 const razorpay = getRazorpay()

 if(!razorpay){
   return NextResponse.json(
    {success:false,error:'RAZORPAY_NOT_CONFIGURED'},
    {status:500}
   )
 }

 const subscriptionDoc = {
   orgId,
   planCode:plan.code,
   amount:plan.amount,
   status:'PENDING',
   createdAt:new Date(),
   updatedAt:new Date()
 }

 const result =
   await db.collection('subscriptions')
   .insertOne(subscriptionDoc)

 return NextResponse.json({
   success:true,
   subscriptionId:String(result.insertedId),
   plan
 })
}
