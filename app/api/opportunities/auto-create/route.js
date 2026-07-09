export const dynamic='force-dynamic'

import { NextResponse } from 'next/server'
import {
 autoCreateOpportunities
} from '@/lib/opportunities/auto-create'

export async function POST(){

 const result =
  await autoCreateOpportunities()

 return NextResponse.json({
   success:true,
   ...result
 })

}
