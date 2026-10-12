import { notifyGoogleIndexing } from '../../../lib/googleIndexing'
import { NextResponse } from 'next/server'
import { isJobOpening } from '../../../lib/isJobOpening'

export async function POST(request) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const job = body.record

  if (!job || !job.id) {
    return NextResponse.json({ error: 'Missing job data' }, { status: 400 })
  }
  if (!isJobOpening(job.title)) {
  return NextResponse.json({ skipped: true, reason: 'Not a job opening' })
  }

  const url = `https://dwarsing.in/jobs/${job.id}`
  const result = await notifyGoogleIndexing(url)

  return NextResponse.json(result)
}