import { foodTags, type FoodTag } from '../food'
import { TagCheckbox } from './TagCheckbox'

export type MenuFiltersValue = {
  query: string
  tags: Array<FoodTag>
  /** null means no ceiling, so items added later are not filtered out. */
  maxPrice: number | null
}

type MenuFiltersProps = {
  value: MenuFiltersValue
  onChange: (value: MenuFiltersValue) => void
  /** The cheapest and priciest items on the menu, so the slider spans the data. */
  priceRange: { min: number; max: number }
  resultCount: number
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function MenuFilters({
  value,
  onChange,
  priceRange,
  resultCount,
}: MenuFiltersProps) {
  // Trimmed to match the filtering itself, so stray whitespace is not "a filter".
  const isFiltered =
    value.query.trim() !== '' ||
    value.tags.length > 0 ||
    (value.maxPrice !== null && value.maxPrice < priceRange.max)

  function toggleTag(tag: FoodTag) {
    onChange({
      ...value,
      tags: value.tags.includes(tag)
        ? value.tags.filter((t) => t !== tag)
        : [...value.tags, tag],
    })
  }

  /* <search> maps to role="search", but the role is stated outright for
     assistive tech that does not yet know the element. */
  return (
    <search role="search" className="mt-10 border-y border-line py-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="menu-search"
            className="block text-xs tracking-wide uppercase text-muted"
          >
            Search
          </label>
          <input
            id="menu-search"
            type="search"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            placeholder="Burger, pasta, something spicy…"
            className="mt-2 w-full rounded-[3px] border border-line bg-card px-3 py-2 text-[0.9375rem] text-strong placeholder:text-muted"
          />
        </div>

        <div className="sm:w-64">
          <label
            htmlFor="menu-max-price"
            className="flex items-baseline justify-between text-xs tracking-wide uppercase text-muted"
          >
            Max price
            <span className="text-sm tabular-nums normal-case text-strong">
              {currency.format(value.maxPrice ?? priceRange.max)}
            </span>
          </label>
          <input
            id="menu-max-price"
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={1}
            value={value.maxPrice ?? priceRange.max}
            onChange={(e) =>
              onChange({ ...value, maxPrice: Number(e.target.value) })
            }
            className="mt-3 w-full accent-strong"
          />
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="text-xs tracking-wide uppercase text-muted">
          Tags
        </legend>
        <ul className="mt-3 flex flex-wrap gap-2">
          {foodTags.map((tag) => (
            <li key={tag}>
              <TagCheckbox
                tag={tag}
                selected={value.tags.includes(tag)}
                onToggle={toggleTag}
              />
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted">
        <p aria-live="polite">
          {resultCount} {resultCount === 1 ? 'item' : 'items'}
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={() =>
              onChange({ query: '', tags: [], maxPrice: null })
            }
            className="underline underline-offset-4 transition-colors hover:text-strong"
          >
            Clear filters
          </button>
        )}
      </div>
    </search>
  )
}
