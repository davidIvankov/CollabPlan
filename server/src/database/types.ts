import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Json = JsonValue

export type JsonArray = JsonValue[]

export type JsonObject = {
  [K in string]?: JsonValue
}

export type JsonPrimitive = boolean | number | string | null

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Invitations {
  createdAt: Generated<Timestamp>
  id: Generated<string>
  invitedById: string
  invitedUserId: string
  projectId: string
  status: Generated<string>
}

export interface Notification {
  createdAt: Generated<Timestamp>
  emailed: Generated<boolean>
  id: Generated<string>
  message: string
  projectId: string
  seen: Generated<boolean>
  taskId: string | null
  triggeredBy: string
  type: string
  userId: string
}

export interface Project {
  createdAt: Generated<Timestamp>
  createdBy: string | null
  description: string
  id: Generated<string>
  name: string
}

export interface ProjectParticipant {
  availability: Generated<Json>
  projectId: string
  role: Generated<string>
  userId: string
}

export interface Task {
  assignedTo: string | null
  createdAt: Generated<Timestamp>
  description: string | null
  duration: number
  id: Generated<string>
  name: string
  projectId: string
  scheduledTime: Generated<Json | null>
  status: Generated<string>
}

export interface User {
  email: string
  id: Generated<string>
  name: string
  password: string
}

export interface DB {
  invitations: Invitations
  notification: Notification
  project: Project
  projectParticipant: ProjectParticipant
  task: Task
  user: User
}
