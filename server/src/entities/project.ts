import { z } from 'zod'
import type { Project } from '@server/database'
import type { Insertable, Selectable, Updateable } from 'kysely'
import { idSchema } from './shared'

export const projectSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(500),
  description: z.string().min(20).max(2000),
  createdBy: idSchema,
  createdAt: z.date().default(() => new Date()),
})

export const projectUpdateSchema = projectSchema
  .pick({
    id: true,
    name: true,
    description: true,
  })
  .partial({ description: true })

export const projectInsertableSchema = projectSchema.omit({
  id: true,
  createdBy: true,
  createdAt: true,
})

export type ProjectByParticipant = {
  id: string
  name: string
  role: 'admin' | 'member'
}

export const projectKeysAll = Object.keys(
  projectSchema.shape
) as (keyof Project)[]

export const projectKeysPublic = projectKeysAll

export type ProjectPublic = Pick<
  Selectable<Project>,
  (typeof projectKeysPublic)[number]
>

export type ProjectInsertable = Insertable<Omit<Project, 'id' | 'createdAt'>>
export type ProjectInsertableNoUser = Insertable<
  Omit<Project, 'createdBy' | 'id' | 'createdAt'>
>

export type ProjectUpdate = Updateable<Pick<Project, 'name' | 'description'>> &
  Pick<Selectable<Project>, 'id'>

export function isProject(
  project: ProjectPublic | undefined
): project is ProjectPublic {
  return project !== undefined
}
