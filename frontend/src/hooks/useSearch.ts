import { useMemo } from 'react'

/**
 * A hook to filter an array of items based on a search term and a set of keys.
 * 
 * @param items The items to filter
 * @param searchTerm The term to search for
 * @param searchKeys The keys of the items to search in
 */
export function useSearch<T>(items: T[] | undefined, searchTerm: string, searchKeys: (keyof T)[]) {
  const filteredItems = useMemo(() => {
    if (!items) return []
    if (!searchTerm.trim()) return items

    const lowerSearchTerm = searchTerm.toLowerCase()

    return items.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(lowerSearchTerm)
      })
    })
  }, [items, searchTerm, searchKeys])

  return filteredItems
}
