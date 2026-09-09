export const CATEGORY_EMOJI = {
  Gloves: '🧤',
  Masks: '😷',
  Syringes: '💉',
  'IV & Infusion': '💧',
  'Catheters & Bags': '🩺',
  'Dressings & Bandages': '🩹',
  Respiratory: '🫁',
  Diagnostics: '🌡️',
  General: '🏥',
}

export default function Logo({ src, size = 42, rounded = 'rounded-xl' }) {
  if (src) {
    return (
      <img
        src={src}
        alt="Store logo"
        style={{ width: size, height: size }}
        className={`${rounded} object-cover border border-slate-200 bg-white shrink-0`}
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={`${rounded} bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0 shadow-sm`}
    >
      <svg viewBox="0 0 64 64" style={{ width: size * 0.62, height: size * 0.62 }} aria-hidden>
        <path d="M28 12h8v16h16v8H36v16h-8V36H12v-8h16z" fill="#fff" />
      </svg>
    </div>
  )
}
