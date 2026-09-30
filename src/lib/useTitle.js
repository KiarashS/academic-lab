import { useEffect } from 'react'
import site from '../config/site.js'

export default function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${site.name}` : site.name
  }, [title])
}
