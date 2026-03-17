import Image from 'next/image'

export interface ProductColour {
  colour_name: string
  hex_value: string | null
}

export interface Product {
  id: string
  name: string
  display_name: string | null
  description: string | null
  material: string | null
  images: string[] | null
  categories: { name: string } | null
  colours: ProductColour[]
  sizes: string[]
}

interface Props {
  product: Product
  onQuote: (name: string) => void
  onSelect: (product: Product) => void
}

export default function ProductCard({ product, onQuote, onSelect }: Props) {
  const name = product.display_name || product.name
  const spec = product.material || product.description || ''
  const image = product.images?.[0] ?? null

  return (
    <div className="pcard">
      <div className="pcard-img-wrap" onClick={() => onSelect(product)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onSelect(product)} aria-label={`View ${name} details`}>
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="pcard-img"
            sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
        ) : (
          <div className="pcard-no-img" />
        )}
      </div>
      <div className="pcard-body">
        {product.categories?.name && (
          <span className="pcard-category">{product.categories.name}</span>
        )}
        <h3 className="pcard-name">{name}</h3>
        {spec && <p className="pcard-spec">{spec}</p>}
        <button className="pcard-btn" onClick={() => onQuote(name)} type="button">
          Get a Quote
        </button>
      </div>
    </div>
  )
}
