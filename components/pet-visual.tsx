type Props = { species: 'dog' | 'cat'; size?: 'sm' | 'md' | 'lg'; label?: string }

export function PetVisual({ species, size = 'md', label }: Props) {
  return (
    <div className={`pet-visual pet-visual-${species} pet-visual-${size}`} role={label ? 'img' : undefined} aria-label={label}>
      <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
        {species === 'dog' ? <>
          <path className="pet-ear pet-ear-left" d="M54 76C22 42 27 18 62 34c22 10 31 30 29 48z" />
          <path className="pet-ear pet-ear-right" d="M186 76c32-34 27-58-8-42-22 10-31 30-29 48z" />
          <path className="pet-head" d="M120 44c-48 0-76 31-76 80 0 49 28 77 76 77s76-28 76-77c0-49-28-80-76-80z" />
          <ellipse className="pet-muzzle" cx="120" cy="142" rx="43" ry="35" />
          <circle className="pet-eye" cx="92" cy="113" r="7" /><circle className="pet-eye" cx="148" cy="113" r="7" />
          <path className="pet-nose" d="M108 135c0-8 24-8 24 0 0 8-5 13-12 13s-12-5-12-13z" />
          <path className="pet-mouth" d="M120 148v8m0 0c-8 9-16 7-21 3m21-3c8 9 16 7 21 3" />
        </> : <>
          <path className="pet-ear pet-ear-left" d="M55 82 49 35c-1-10 9-15 17-8l35 34z" />
          <path className="pet-ear pet-ear-right" d="m185 82 6-47c1-10-9-15-17-8l-35 34z" />
          <path className="pet-head" d="M120 51c-47 0-73 32-73 78 0 47 27 74 73 74s73-27 73-74c0-46-26-78-73-78z" />
          <path className="pet-muzzle" d="M91 142c7-18 51-18 58 0-7 27-51 27-58 0z" />
          <path className="pet-eye" d="M79 111 101 105" /><path className="pet-eye" d="M139 105 161 111" />
          <path className="pet-nose" d="M111 137c4-5 14-5 18 0-1 7-5 10-9 10s-8-3-9-10z" />
          <path className="pet-mouth" d="M120 147c-6 8-13 9-18 7m18-7c6 8 13 9 18 7" />
          <path className="pet-whisker" d="M77 143 35 136m43 16-43 6m131-15 42-7m-42 19 43 6" />
        </>}
      </svg>
      <span className="pet-visual-ring" />
    </div>
  )
}