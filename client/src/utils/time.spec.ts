import { describe, it, expect } from 'vitest'
import {
  convertToUTC,
  getUserLocalDate,
  formatSlot,
  formatDateForTemplate,
  formatForCalendar,
  dateForCalendar,
} from './time'

describe('time utilities', () => {
  it('convertToUTC should convert a local date to UTC', () => {
    const localDate = new Date('2025-03-29T12:00:00')
    const utcDate = convertToUTC(localDate)

    expect(utcDate.toISOString()).toBe('2025-03-29T12:00:00.000Z')
  })

  it('getUserLocalDate should return the current local date in datetime-local format', () => {
    const userLocalDate = getUserLocalDate()
    const now = new Date()

    expect(userLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(userLocalDate.startsWith(now.getFullYear().toString())).toBe(true)
  })

  it('formatSlot should return a Slot object with start and end times in UTC', () => {
    const startTime = '2025-03-29T12:00:00'
    const duration = 60 // 60 minutes
    const slot = formatSlot(startTime, duration)

    expect(slot.start).toBe('2025-03-29T12:00:00.000Z')
    expect(slot.end).toBe('2025-03-29T13:00:00.000Z')
  })

  it('formatDateForTemplate should format a date string into a readable format', () => {
    const dateString = '2025-03-29T12:00:00.000Z'
    const formattedDate = formatDateForTemplate(dateString)
    console.log(formattedDate)
    expect(formattedDate).toBe('Saturday, March 29, 2025 at 12:00:00 PM')
  })

  it('formatForCalendar should format a UTC date string for calendar display', () => {
    const utcDateString = '2025-03-29T12:00:00.000Z'
    const formattedDate = formatForCalendar(utcDateString)

    expect(formattedDate).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  it('dateForCalendar should format a Date object for calendar display', () => {
    const date = new Date('2025-03-29T12:00:00')
    const formattedDate = dateForCalendar(date)

    expect(formattedDate).toBe('2025-03-29 12:00')
  })
})
