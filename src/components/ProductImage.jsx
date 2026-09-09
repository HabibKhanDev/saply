import { CATEGORY_EMOJI } from './Logo'

export default function ProductImage({ product, className = '', emojiClass = 'text-5xl' }) {
  const url = product?.images?.[0]
  const emoji = CATEGORY_EMOJI[product?.category] || '🏥'

  if (url) {
    return (
      <img
        src={url}
        alt={product?.name || 'Product'}
        loading="lazy"
        className={`object-cover bg-white ${className}`} />
    )
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 ${className}`}>
      <span className={emojiClass} role="img" aria-label={product?.category || 'medical product'}>
        {emoji}
      </span>
    </div>
  )
}
