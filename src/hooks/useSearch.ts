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
    let result = items
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      result = items.filter((item) => {
        return searchKeys.some((key) => {
          const value = item[key]
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(lowerSearchTerm)
        })
      })
    }

    return [...result].sort((a: any, b: any) => {
      const timeA = new Date(a.updated_at || a.created_at || 0).getTime() || 0
      const timeB = new Date(b.updated_at || b.created_at || 0).getTime() || 0
      return timeB - timeA
    })
  }, [items, searchTerm, searchKeys])

  return filteredItems
}
