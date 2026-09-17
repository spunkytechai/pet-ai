export type SpeciesProfile = {
  commonName: string
  scientificName: string
  group: string
  origin: string
  lifespan: string
  adultSize: string
  temperament: string
  energy: string
  intelligence: string
  socialNeeds: string
  grooming: string
  exercise: string
  diet: string
  training: string
  environment: string
  behavior: string[]
  ownerShouldKnow: string[]
  watchFor: string[]
  careChecklist: string[]
  identificationNotes: string[]
}

export function buildSpeciesProfile(input: {
  commonName: string
  scientificName?: string
  group?: string
  confidence?: number
  imageNotes?: string[]
  language?: 'en' | 'hi'
}): SpeciesProfile {
  const name = input.commonName || 'Unknown companion animal'
  return {
    commonName: name,
    scientificName: input.scientificName || 'Species/breed requires confirmation',
    group: input.group || 'Companion animal',
    origin: 'Identification result should be treated as an estimate unless confirmed by a qualified professional or reliable records.',
    lifespan: 'Varies by species, breed, genetics, size, and care.',
    adultSize: 'Varies by species and breed.',
    temperament: 'Individual temperament varies; breed-level traits do not predict every individual.',
    energy: 'Varies by age, health, breed, and individual personality.',
    intelligence: 'Trainability and problem-solving vary widely between individuals.',
    socialNeeds: 'Needs species-appropriate social interaction, enrichment, rest, and predictable routines.',
    grooming: 'Grooming needs depend on coat, skin, ears, nails, and breed.',
    exercise: 'Provide age- and health-appropriate physical activity and mental enrichment.',
    diet: 'Use a complete, species-appropriate diet and avoid feeding human foods that may be toxic.',
    training: 'Use reward-based, consistent training and avoid punishment-based methods.',
    environment: 'Provide safe shelter, clean water, comfortable rest, and hazard-free spaces.',
    behavior: input.imageNotes?.length ? input.imageNotes : ['Identification is based on visible features; behavior cannot be reliably inferred from a single photo.'],
    ownerShouldKnow: [
      'A photo can suggest species or breed, but mixed breeds and similar-looking animals can make identification uncertain.',
      'Age, sex, health status, and exact breed should not be inferred as facts from appearance alone.',
      'Routine preventive veterinary care, vaccination appropriate to local guidance, parasite control, identification, and dental care are important parts of responsible ownership.',
      'Changes in appetite, breathing, mobility, elimination, behavior, or energy can matter more than appearance and should be discussed with a veterinarian when persistent or concerning.'
    ],
    watchFor: [
      'Difficulty breathing, collapse, uncontrolled bleeding, seizures, severe injury, or other acute distress warrants urgent veterinary attention.',
      'Sudden major behavior change, persistent vomiting/diarrhea, refusal to eat or drink, or marked lethargy deserves veterinary assessment.'
    ],
    careChecklist: [
      'Fresh water available',
      'Complete species-appropriate nutrition',
      'Safe daily exercise and enrichment',
      'Regular grooming and nail/ear/dental care as appropriate',
      'Preventive veterinary care and vaccinations',
      'Parasite prevention appropriate to the animal and local veterinary advice',
      'Microchip or reliable identification where appropriate'
    ],
    identificationNotes: [
      `AI identification confidence: ${Math.round((input.confidence || 0) * 100)}%`,
      'Visual identification is probabilistic and should not be used as proof of pedigree or medical status.'
    ]
  }
}
