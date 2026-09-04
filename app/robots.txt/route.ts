import { NextResponse } from 'next/server'
export function GET(){return new NextResponse('User-agent: *\nDisallow: /\n',{headers:{'content-type':'text/plain'}})}
