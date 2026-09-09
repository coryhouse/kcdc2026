import { useRef, useState } from 'react'
import { foodTags, type Food, type FoodTag } from '../food'
import { addFood, foodNameTaken } from '../foodStore'
import { FoodCard } from './FoodCard'
import { TagCheckbox } from './TagCheckbox'

type NewFoodFormProps = {
  /** Called with the saved food once it is on the menu. */
  onAdded: (food: Food) => void
}

type Fields = {
  name: string
  image: string
  price: string
  description: string
  tags: Array<FoodTag>
}

type FieldName = keyof Fields

/** Every field, in the order they appear, so focus lands on the first problem. */
const fieldOrder = [
  'name',
  'image',
  'price',
  'description',
  'tags',
] as const satisfies ReadonlyArray<FieldName>

type Errors = Partial<Record<FieldName, string>>

const emptyFields: Fields = {
  name: '',
  image: '',
  price: '',
  description: '',
  tags: [],
}

const inputClass =
  'mt-2 w-full rounded-[3px] border border-line bg-card px-3 py-2 text-[0.9375rem] text-strong placeholder:text-muted aria-invalid:border-error'

const labelClass = 'block text-xs tracking-wide uppercase text-muted'

const hintClass = 'mt-2 text-xs leading-relaxed text-muted'

const errorClass = 'mt-2 text-xs leading-relaxed text-error'

function validate(fields: Fields): Errors {
  const errors: Errors = {}

  const name = fields.name.trim()
  if (name === '') errors.name = 'Enter a name.'
  else if (foodNameTaken(name)) errors.name = `“${name}” is already on the menu.`

  if (fields.image.trim() === '')
    errors.image = 'Enter an image file name or URL.'

  const price = fields.price.trim()
  if (price === '') errors.price = 'Enter a price.'
  else if (!/^\d*\.?\d*$/.test(price) || Number.isNaN(Number(price)))
    errors.price = 'Enter a price like 9.99.'
  else if (Number(price) <= 0) errors.price = 'Enter a price above $0.'
  else if (!/^\d+(\.\d{1,2})?$/.test(price))
    errors.price = 'Use at most two decimal places.'
  else if (Number(price) >= 1000) errors.price = 'Enter a price under $1,000.'

  if (fields.description.trim() === '')
    errors.description = 'Enter a description.'

  if (fields.tags.length === 0) errors.tags = 'Pick at least one tag.'

  return errors
}

export function NewFoodForm({ onAdded }: NewFoodFormProps) {
  const [fields, setFields] = useState<Fields>(emptyFields)
  const [errors, setErrors] = useState<Errors>({})
  const controls = useRef(new Map<FieldName, HTMLElement | null>())

  function update<K extends FieldName>(field: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [field]: value }))
    // Drop the message as soon as the reader starts fixing the field; the next
    // submit re-checks everything anyway.
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function toggleTag(tag: FoodTag) {
    update(
      'tags',
      fields.tags.includes(tag)
        ? fields.tags.filter((t) => t !== tag)
        : [...fields.tags, tag],
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(fields)
    setErrors(found)

    const firstInvalid = fieldOrder.find((field) => found[field])
    if (firstInvalid) {
      controls.current.get(firstInvalid)?.focus()
      return
    }

    const created = addFood({
      name: fields.name.trim(),
      image: fields.image.trim(),
      price: Number(fields.price),
      description: fields.description.trim(),
      tags: fields.tags,
    })
    setFields(emptyFields)
    onAdded(created)
  }

  /** What a field needs on it to announce its own error, if it has one. */
  function ariaProps(field: FieldName) {
    const message = errors[field]
    return {
      'aria-invalid': message ? true : undefined,
      'aria-describedby': message ? `new-food-${field}-error` : undefined,
    }
  }

  /** Remembers where to send focus when this field is the first one at fault. */
  function focusTarget(field: FieldName) {
    return (element: HTMLElement | null) => {
      controls.current.set(field, element)
    }
  }

  function fieldProps(field: FieldName) {
    return { ref: focusTarget(field), ...ariaProps(field) }
  }

  return (
    <div className="mt-10 grid gap-12 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label htmlFor="new-food-name" className={labelClass}>
            Name
          </label>
          <input
            id="new-food-name"
            type="text"
            value={fields.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Chicken Street Tacos"
            className={inputClass}
            {...fieldProps('name')}
          />
          {errors.name && (
            <p id="new-food-name-error" role="alert" className={errorClass}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="new-food-image" className={labelClass}>
            Image
          </label>
          <input
            id="new-food-image"
            type="text"
            value={fields.image}
            onChange={(e) => update('image', e.target.value)}
            placeholder="street-tacos.jpg"
            className={inputClass}
            {...fieldProps('image')}
          />
          {errors.image ? (
            <p id="new-food-image-error" role="alert" className={errorClass}>
              {errors.image}
            </p>
          ) : (
            <p className={hintClass}>
              A file already in <code>public/images</code>, or a full URL.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="new-food-price" className={labelClass}>
            Price
          </label>
          <input
            id="new-food-price"
            type="text"
            inputMode="decimal"
            value={fields.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="9.99"
            className={`${inputClass} tabular-nums`}
            {...fieldProps('price')}
          />
          {errors.price && (
            <p id="new-food-price-error" role="alert" className={errorClass}>
              {errors.price}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="new-food-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="new-food-description"
            rows={3}
            value={fields.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Delicious chicken tacos with a spicy mango salsa."
            className={`${inputClass} resize-y leading-relaxed`}
            {...fieldProps('description')}
          />
          {errors.description && (
            <p
              id="new-food-description-error"
              role="alert"
              className={errorClass}
            >
              {errors.description}
            </p>
          )}
        </div>

        {/* The fieldset carries the invalid state, since no single checkbox is
            the one at fault — but a fieldset cannot take focus, so that goes to
            the first pill instead. */}
        <fieldset {...ariaProps('tags')}>
          <legend className={labelClass}>Tags</legend>
          <ul className="mt-3 flex flex-wrap gap-2">
            {foodTags.map((tag, i) => (
              <li key={tag}>
                <TagCheckbox
                  tag={tag}
                  selected={fields.tags.includes(tag)}
                  onToggle={toggleTag}
                  ref={i === 0 ? focusTarget('tags') : undefined}
                />
              </li>
            ))}
          </ul>
          {errors.tags && (
            <p id="new-food-tags-error" role="alert" className={errorClass}>
              {errors.tags}
            </p>
          )}
        </fieldset>

        <div className="flex items-center gap-4 border-t border-line pt-6">
          <button
            type="submit"
            className="rounded-[3px] border border-strong bg-strong px-4 py-2 text-sm text-card transition-opacity hover:opacity-90"
          >
            Add to menu
          </button>
          <button
            type="button"
            onClick={() => {
              setFields(emptyFields)
              setErrors({})
            }}
            className="text-sm text-muted underline underline-offset-4 transition-colors hover:text-strong"
          >
            Reset
          </button>
        </div>
      </form>

      <aside aria-label="Preview">
        <p className={labelClass}>Preview</p>
        <div className="mt-3 lg:sticky lg:top-8">
          <FoodCard
            food={{
              id: 0,
              name: fields.name.trim() || 'Untitled item',
              image: fields.image.trim(),
              price: Number(fields.price) || 0,
              description:
                fields.description.trim() ||
                'The description shows up here as you type it.',
              tags: fields.tags,
            }}
          />
        </div>
      </aside>
    </div>
  )
}
