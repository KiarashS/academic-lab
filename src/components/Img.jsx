import { images } from '../lib/data.js'
import { asset } from '../lib/utils.js'

// An <img> for content photos. When the build made resized copies (scripts/images.js), the
// browser picks the smallest one that fits `sizes`; otherwise it loads the original.
export default function Img({ src, sizes = '100vw', alt = '', ...rest }) {
  const info = src && images[String(src).replace(/^\//, '').split(/[?#]/)[0]]
  return (
    <img
      src={asset(src)}
      srcSet={info ? info.variants.map((v) => `${asset(v.url)} ${v.width}w`).join(', ') : undefined}
      sizes={info ? sizes : undefined}
      width={info?.width}
      height={info?.height}
      alt={alt}
      decoding="async"
      {...rest}
    />
  )
}
