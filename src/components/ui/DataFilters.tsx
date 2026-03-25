import { useState } from 'react'
import { Filter, X, Search } from 'lucide-react'

export interface FilterOption {
  label: string
  key: string
  type: 'text' | 'select' | 'boolean'
  options?: { label: string; value: string | boolean }[]
}

interface DataFiltersProps {
  options: FilterOption[]
  onFilter: (filters: Record<string, any>) => void
  onClear: () => void
  className?: string
}

function DataFilters({ options, onFilter, onClear, className = '' }: DataFiltersProps) {
  const [selectedField, setSelectedField] = useState<string>(options[0]?.key || '')
  const [value, setValue] = useState<string>('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})

  const currentOption = options.find((opt) => opt.key === selectedField)

  const handleApplyFilter = () => {
    if (!selectedField || value === '') return
    
    // For boolean 'false' we need to handle it correctly if value is 'false'
    let finalValue: any = value
    if (currentOption?.type === 'boolean') {
      finalValue = value === 'true'
    }

    const newFilters = { ...activeFilters, [selectedField]: finalValue }
    setActiveFilters(newFilters)
    onFilter(newFilters)
    setValue('') // Reset value after applying to allow adding more? 
    // Actually, usually you apply one at a time or together.
    // Let's keep it simple: apply this specific filter.
  }

  const handleClear = () => {
    setActiveFilters({})
    setValue('')
    onClear()
  }

  const removeFilter = (key: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    setActiveFilters(newFilters)
    if (Object.keys(newFilters).length === 0) {
      onClear()
    } else {
      onFilter(newFilters)
    }
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 px-2 text-slate-500">
          <Filter size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Filtrar por:</span>
        </div>

        <select
          value={selectedField}
          onChange={(e) => {
            setSelectedField(e.target.value)
            setValue('')
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
          {options.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>

        {currentOption?.type === 'select' || currentOption?.type === 'boolean' ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 min-w-[120px]"
          >
            <option value="">Seleccionar...</option>
            {currentOption.options?.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valor..."
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        )}

        <button
          onClick={handleApplyFilter}
          disabled={!value && value !== '0'}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <Search size={16} />
          Filtrar
        </button>

        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-bold text-slate-500 hover:text-red-600 transition dark:text-slate-400 dark:hover:text-red-400 ml-2"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          {Object.entries(activeFilters).map(([key, val]) => {
            const opt = options.find((o) => o.key === key)
            let displayVal = val
            if (opt?.type === 'boolean') displayVal = val ? 'Sí' : 'No'
            if (opt?.type === 'select') {
              displayVal = opt.options?.find(o => String(o.value) === String(val))?.label || val
            }

            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
              >
                <span className="opacity-60">{opt?.label}:</span> {String(displayVal)}
                <button
                  onClick={() => removeFilter(key)}
                  className="rounded-full p-0.5 hover:bg-violet-200 dark:hover:bg-violet-800 transition"
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DataFilters
