import type { Food } from '../food'

type FoodCardProps = {
  food: Food
  /** The first row is above the fold, so those images load eagerly. */
  priority?: boolean
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function FoodCard({ food, priority = false }: FoodCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[3px] border border-line bg-card">
      <img
        src={`/images/${food.image}`}
        alt={food.name}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        className="aspect-square w-full object-cover"
      />

      <div className="flex flex-1 flex-col gap-3 border-t border-line p-5">
        {/* Name and price share a baseline, the way a printed menu sets them. */}
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl leading-snug font-medium text-strong">
            {food.name}
          </h2>
          <p className="shrink-0 text-[0.9375rem] tabular-nums text-strong">
            {currency.format(food.price)}
          </p>
        </div>

        <p className="text-[0.9375rem] leading-relaxed text-muted">
          {food.description}
        </p>

        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {food.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
