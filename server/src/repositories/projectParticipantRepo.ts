import type { Database, JsonArray, JsonObject } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import {
  projectParticipantKeysPublic,
  type InsertableSetAvailability,
  type ProjectParticipantInsertable,
  type ProjectParticipantPublic,
  type UpdateRoleInsertable,
} from '@server/entities/projectParticipant'
import type { Slot } from '@server/entities/shared'
import { type TaskAssignArguments } from '../entities/task'

export function projectParticipantRepository(db: Database) {
  return {
    async create(
      insertableProjectParticipant: ProjectParticipantInsertable
    ): Promise<ProjectParticipantPublic> {
      return db
        .insertInto(TABLES.PROJECT_PARTICIPANT)
        .values(insertableProjectParticipant)
        .returning(projectParticipantKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async get(
      query: ProjectParticipantInsertable
    ): Promise<ProjectParticipantPublic> {
      const { userId, projectId } = query

      return db
        .selectFrom(TABLES.PROJECT_PARTICIPANT)
        .select(projectParticipantKeysPublic)
        .where('userId', '=', userId)
        .where('projectId', '=', projectId)
        .executeTakeFirstOrThrow()
    },
    async remove(
      query: ProjectParticipantInsertable
    ): Promise<ProjectParticipantPublic> {
      const { userId, projectId } = query

      return db
        .deleteFrom(TABLES.PROJECT_PARTICIPANT)
        .where('userId', '=', userId)
        .where('projectId', '=', projectId)
        .returning(projectParticipantKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async changeRole(argument: UpdateRoleInsertable) {
      const { role, userId, projectId } = argument

      return db
        .updateTable(TABLES.PROJECT_PARTICIPANT)
        .where('userId', '=', userId)
        .where('projectId', '=', projectId)
        .set({ role })
        .returning(projectParticipantKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async setAvailability(availabilityInsert: InsertableSetAvailability) {
      const { projectId, userId, availability } = availabilityInsert
      const oldAvailability = await db
        .selectFrom(TABLES.PROJECT_PARTICIPANT)
        .where('userId', '=', userId)
        .where('projectId', '=', projectId)
        .select(['availability'])
        .executeTakeFirstOrThrow()

      // All this belove to make typescript error stop!! it works don't know how?
      const oldAvailabilityArray = makeIterable(oldAvailability.availability)

      const newAvailability = mergeAvailability([
        ...oldAvailabilityArray,
        ...availability,
      ])

      // adds availability slot and sorts it and merges it if the cover the same time
      return db
        .updateTable(TABLES.PROJECT_PARTICIPANT)
        .set({ availability: JSON.stringify(newAvailability) })
        .where('userId', '=', userId)
        .where('projectId', '=', projectId)
        .returning(['availability'])
        .executeTakeFirst()
    },
    async removeAvailability(args: TaskAssignArguments) {
      const { projectId, userId, scheduledTime } = args
      const oldAvailability = await db
        .selectFrom(TABLES.PROJECT_PARTICIPANT)
        .where('userId', '=', userId)
        .where('projectId', '=', projectId)
        .select(['availability'])
        .executeTakeFirstOrThrow()

      const oldAvailabilityArray = makeIterable(oldAvailability.availability)

      const newAvailability = remove(oldAvailabilityArray, scheduledTime)

      return db
        .updateTable(TABLES.PROJECT_PARTICIPANT)
        .set({ availability: JSON.stringify(newAvailability) })
        .where('userId', '=', userId)
        .where('projectId', '=', projectId)
        .returning(['availability'])
        .executeTakeFirst()
    },
  }
}

function mergeAvailability(slots: { start: string; end: string }[]) {
  if (slots.length === 0) return []

  // Sort by start time first
  slots.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  const merged: { start: string; end: string }[] = []

  let currentSlot = slots[0]

  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < slots.length; i++) {
    if (
      new Date(slots[i].start).getTime() <= new Date(currentSlot.end).getTime()
    ) {
      // If overlapping or adjacent, merge
      currentSlot.end =
        new Date(slots[i].end) > new Date(currentSlot.end)
          ? slots[i].end
          : currentSlot.end
    } else {
      // No overlap, push current slot and move to next
      merged.push(currentSlot)
      currentSlot = slots[i]
    }
  }

  // Push the last slot
  merged.push(currentSlot)

  return merged
}

function makeIterable(
  oldAvailability: string | number | boolean | JsonArray | JsonObject | null
) {
  return Array.isArray(oldAvailability)
    ? oldAvailability.filter(isValidSlot)
    : [] // default to empty array if it's not an array
}

function isValidSlot(slot: unknown): slot is { start: string; end: string } {
  return (
    typeof slot === 'object' &&
    slot !== null &&
    'start' in slot &&
    'end' in slot &&
    typeof slot.start === 'string' &&
    typeof slot.end === 'string'
  )
}

function remove(availability: Slot[], slot: Slot): Slot[] {
  return availability.flatMap((interval) => {
    console.log(slot)
    let result: Slot | Slot[] = interval

    if (isInInterval(slot, interval)) {
      result = splitInterval(interval, slot)
    }
    return result
  })
}

function isInInterval(slot: Slot, interval: Slot) {
  return slot.start >= interval.start && interval.end >= slot.end
}

function splitInterval(interval: Slot, slot: Slot) {
  const result = []

  // If the removed part cuts the start
  if (slot.start > interval.start) {
    result.push({ start: interval.start, end: slot.start })
  }

  // If the removed part cuts the end
  if (slot.end < interval.end) {
    result.push({ start: slot.end, end: interval.end })
  }

  return result
}
