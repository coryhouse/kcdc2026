import { useSyncExternalStore } from 'react'
import { foodTags, foods as seedFoods, type Food, type FoodTag } from './food'

/** Everything a new food needs; the store assigns the id. */
export type NewFood = Omit<Food, 'id'>

const STORAGE_KEY = 'added-foods'

const listeners = new Set<() => void>()

let added: Array<Food> = readStored()
// useSyncExternalStore compares snapshots by reference, so the combined list is
// built once per change rather than on every read.
let snapshot: Array<Food> = [...seedFoods, ...added]

function isFoodTag(value: unknown): value is FoodTag {
  return foodTags.includes(value as FoodTag)
}

/**
 * Stored JSON is untrusted: it may predate a change to the Food shape, or have
 * been edited by hand. Anything that does not match is dropped.
 */
function isFood(value: unknown): value is Food {
  if (typeof value !== 'object' || value === null) return false
  const food = value as Record<string, unknown>
  return (
    typeof food.id === 'number' &&
    typeof food.name === 'string' &&
    typeof food.image === 'string' &&
    typeof food.price === 'number' &&
    typeof food.description === 'string' &&
    Array.isArray(food.tags) &&
    food.tags.every(isFoodTag)
  )
}

function readStored(): Array<Food> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isFood) : []
  } catch {
    // Blocked storage or malformed JSON: start from the seeded menu.
    return []
  }
}

function commit(next: Array<Food>) {
  added = next
  snapshot = [...seedFoods, ...added]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(added))
  } catch {
    // The addition won't survive a reload, but the menu still shows it.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Array<Food> {
  return snapshot
}

/** The seeded menu plus anything added since, oldest addition first. */
export function useFoods(): Array<Food> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Adds a food to the menu and returns it, id and all. */
export function addFood(food: NewFood): Food {
  const nextId = snapshot.reduce((max, item) => Math.max(max, item.id), 0) + 1
  const created: Food = { ...food, id: nextId }
  commit([...added, created])
  return created
}

/** True when a food by this name is already on the menu. */
export function foodNameTaken(name: string): boolean {
  const normalized = name.trim().toLowerCase()
  return snapshot.some((food) => food.name.toLowerCase() === normalized)
}

/**
 * Re-reads storage and notifies subscribers. The module holds the list in
 * memory, so tests that clear localStorage need this to clear the store too.
 */
export function resetFoods() {
  commit(readStored())
}
