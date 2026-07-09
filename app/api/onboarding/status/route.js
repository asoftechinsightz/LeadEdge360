import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
export const dynamic='force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'

export async function GET(req){

 const { orgId } = await guardCrmRequest(req)

 const db = await getDb()

 const profile =
   await db.collection('onboarding_profiles')
   .findOne({orgId})

 const branding =
   await db.collection('branding_assets')
   .findOne({orgId})

 const teamCount =
   await db.collection('team_members')
   .countDocuments({orgId})

 return NextResponse.json({
   companyProfile:!!profile?.companyName,
   branding:!!branding,
   team:teamCount>0,
   whatsapp:!!profile?.whatsappEnabled,
   email:!!profile?.emailEnabled,
   teamCount
 })
}
