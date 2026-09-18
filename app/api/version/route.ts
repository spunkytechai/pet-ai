import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    name: 'PET AI',
    version: '0.9.0',
    stage: 'testing',
    intelligence: 'local-deterministic',
    paid_api_required: false,
  })
}