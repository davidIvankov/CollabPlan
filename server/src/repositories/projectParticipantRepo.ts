import type { Database } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import {
  projectParticipantKeysPublic,
  type InsertableSetAvailability,
  type ProjecParticipantInsertable,
  type ProjectParticipantPublic,
} from '@server/entities/projectParticipant'

export function projectParticipantRepository(db: Database) {
  return {
    async create(
      insertableProjectParticipant: ProjecParticipantInsertable
    ): Promise<ProjectParticipantPublic> {
      return db
        .insertInto(TABLES.PROJECT_PARTICIPANT)
        .values(insertableProjectParticipant)
        .returning(projectParticipantKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async get(
      query: ProjecParticipantInsertable
    ): Promise<ProjectParticipantPublic | null> {
      return db
        .selectFrom(TABLES.PROJECT_PARTICIPANT)
        .select(projectParticipantKeysPublic)
        .where('userId', '=', query.userId)
        .where('projectId', '=', query.projectId)
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
      const oldAvailabilityArray = Array.isArray(oldAvailability.availability)
        ? oldAvailability.availability.filter(
            (slot): slot is { start: string; end: string } =>
              typeof slot === 'object' &&
              slot !== null &&
              'start' in slot &&
              'end' in slot &&
              typeof slot.start === 'string' &&
              typeof slot.end === 'string'
          )
        : [] // default to empty array if it's not an array

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
