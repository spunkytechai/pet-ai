import { NextResponse } from 'next/server'
export function GET(){return NextResponse.json({ok:true,service:'pet-ai',version:'0.1.0'})}
