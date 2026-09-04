import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const species = new Set(['dog', 'cat'])

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : ''
  const petSpecies = typeof body?.species === 'string' ? body.species : ''
  const age = body?.age === '' || body?.age == null ? null : Number(body.age)

  if (!name || !species.has(petSpecies) || (age !== null && (!Number.isFinite(age) || age < 0 || age > 50))) {
    return NextResponse.json({ error: 'Valid name, dog/cat species, and optional age are required.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const { data, error } = await supabase.from('pets').insert({ owner_id: user.id, name, species: petSpecies, age_years: age }).select('id,name,species,age_years').single()
  if (error) return NextResponse.json({ error: 'Pet profile could not be created.' }, { status: 500 })

  return NextResponse.json({ pet: data }, { status: 201 })
}
