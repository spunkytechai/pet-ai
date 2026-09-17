import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    name: 'PET AI',
    version: '0.3.0',
    stage: 'private-beta',
  })
}
