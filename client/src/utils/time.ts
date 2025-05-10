import type { Slot } from '@server/shared/types'

export const convertToUTC = (localDate: Date): Date => {
  const offsetMinutes = localDate.getTimezoneOffset()

  const utcDate = new Date(localDate.getTime() - offsetMinutes * 60000)

  return utcDate
}

export const convertToLocal = (utcDateString: string): Date => {
  const utcDate = new Date(utcDateString)
  const offsetMinutes = utcDate.getTimezoneOffset()

  const localDate = new Date(utcDate.getTime() + offsetMinutes * 60000)

  return localDate
}

const formatToDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const getUserLocalDate = (): string => {
  const userDate = new Date()

  return formatToDateTimeLocal(userDate)
}

export const formatSlot = (startTime: string, duration: number): Slot => {
  const startDateLocal = new Date(startTime)
  const startDate = convertToUTC(startDateLocal)

  const endDate = new Date(startDate.getTime() + duration * 60000)
  const startFormatted = startDate.toISOString()
  const endFormatted = endDate.toISOString()

  return {
    start: startFormatted,
    end: endFormatted,
  }
}

export const formatDateForTemplate = (dateString: string) => {
  const date = convertToLocal(dateString)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }).format(date)
}

export const isInDateRange = (dateObj: Date, from: string | null, to: string | null) => {
  const fromDate = from ? new Date(from) : null
  const toDate = to ? new Date(to) : null

  if (toDate) toDate.setHours(23, 59, 59, 999)

  return (!fromDate || dateObj >= fromDate) && (!toDate || dateObj <= toDate)
}

export const formatForCalendar = (utcDateString: string): string => {
  const localDate = convertToLocal(utcDateString)

  return dateForCalendar(localDate)
}

export const dateForCalendar = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
