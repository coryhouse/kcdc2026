import type { Ref } from 'react'
import type { FoodTag } from '../food'

type TagCheckboxProps = {
  tag: FoodTag
  selected: boolean
  onToggle: (tag: FoodTag) => void
  /** Set on the checkbox itself, so a form can move focus to this pill. */
  ref?: Ref<HTMLInputElement>
}

/**
 * A tag rendered as a pill-shaped checkbox. Used both to filter the menu and
 * to tag a new dish, so the two read as the same control.
 */
export function TagCheckbox({
  tag,
  selected,
  onToggle,
  ref,
}: TagCheckboxProps) {
  return (
    /* The input is sr-only, so the pill itself has to show the focus ring.
       has-[:focus-visible] rather than focus-within keeps it off mouse clicks. */
    <label
      className={`flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-strong ${
        selected
          ? 'border-strong bg-strong text-card'
          : 'border-line text-muted hover:text-strong'
      }`}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(tag)}
        className="sr-only"
      />
      {tag}
    </label>
  )
}
