import { NOTIFICATION_TYPE, TABLES } from '@server/database/dbConstants'
import {
  fakeInsertableTask,
  fakeProject,
  fakeProjectParticipant,
  fakeUser,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { insertAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { describe, it } from 'vitest'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { notificationService } from '..'

const db = await wrapInRollbacks(createTestDatabase())
const repository = notificationRepository(db)

const [userOne, userTwo, userThree] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'stipe@gmail.com' }),
  fakeUser({ email: 'jure@gmail.com' }),
])

const [projectOne] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
])

const [task] = await insertAll(db, TABLES.TASK, [
  fakeInsertableTask({ projectId: projectOne.id }),
])

await insertAll(db, TABLES.PROJECT_PARTICIPANT, [
  fakeProjectParticipant({ projectId: projectOne.id, userId: userTwo.id }),
])

const {
  invitation,
  unassignedTask,
  createdTask,
  completedTask,
  deletedTask,
  assignedTask,
  deletedProject,
} = notificationService

describe('notificationService', () => {
  it('sends invitation notification', async () => {
    const result = await invitation(
      { projectName: projectOne.name, triggeredByName: userOne.name },
      repository,
      {
        triggeredBy: userOne.id,
        userId: userThree.id,
        projectId: projectOne.id,
      }
    )

    expect(result).toMatchObject({
      message: `You have been invited to join the project "${projectOne.name}" by ${userOne.name}.`,
      type: NOTIFICATION_TYPE.INVITATION,
      projectId: projectOne.id,
      seen: false,
      triggeredBy: userOne.id,
      userId: userThree.id,
    })
  })
  it('sends created task notification', async () => {
    const result = await createdTask(
      { projectName: projectOne.name, triggeredByName: userOne.name },
      repository,
      [userTwo.id],
      {
        triggeredBy: userOne.id,
        projectId: projectOne.id,
        taskId: task.id,
      }
    )
    expect(result).toMatchObject([
      {
        message: `${userOne.name} created a task in the project "${projectOne.name}".`,
        type: NOTIFICATION_TYPE.PROJECT_UPDATE,
        projectId: projectOne.id,
        seen: false,
        triggeredBy: userOne.id,
        userId: userTwo.id,
        taskId: task.id,
      },
    ])
  })
  it('sends completed task notification', async () => {
    const result = await completedTask(
      {
        projectName: projectOne.name,
        triggeredByName: userOne.name,
        taskName: task.name,
      },
      repository,
      [userTwo.id],
      {
        triggeredBy: userOne.id,
        projectId: projectOne.id,
        taskId: task.id,
      }
    )
    expect(result).toMatchObject([
      {
        message: `${userOne.name} completed the task "${task.name}" in the project "${projectOne.name}".`,
        type: NOTIFICATION_TYPE.PROJECT_UPDATE,
        projectId: projectOne.id,
        seen: false,
        triggeredBy: userOne.id,
        userId: userTwo.id,
        taskId: task.id,
      },
    ])
  })
  it('sends deleted task notification', async () => {
    const result = await deletedTask(
      { projectName: projectOne.name, triggeredByName: userOne.name },
      repository,
      [userTwo.id],
      {
        triggeredBy: userOne.id,
        projectId: projectOne.id,
        taskId: task.id,
      }
    )
    expect(result).toMatchObject([
      {
        message: `${userOne.name} deleted a task in the project "${projectOne.name}".`,
        type: NOTIFICATION_TYPE.PROJECT_UPDATE,
        projectId: projectOne.id,
        seen: false,
        triggeredBy: userOne.id,
        userId: userTwo.id,
        taskId: task.id,
      },
    ])
  })
  it('sends assigned task notification', async () => {
    const result = await assignedTask(
      {
        projectName: projectOne.name,
        triggeredByName: userOne.name,
        taskName: task.name,
      },
      repository,
      [userTwo.id],
      {
        triggeredBy: userOne.id,
        projectId: projectOne.id,
        taskId: task.id,
      }
    )
    expect(result).toMatchObject([
      {
        message: `${userOne.name} has been assigned the task "${task.name}" in the project "${projectOne.name}".`,
        type: NOTIFICATION_TYPE.PROJECT_UPDATE,
        projectId: projectOne.id,
        seen: false,
        triggeredBy: userOne.id,
        userId: userTwo.id,
        taskId: task.id,
      },
    ])
  })
  it('sends unassigned task notification', async () => {
    const result = await unassignedTask(
      {
        projectName: projectOne.name,
        triggeredByName: userOne.name,
        taskName: task.name,
      },
      repository,
      [userTwo.id],
      {
        triggeredBy: userOne.id,
        projectId: projectOne.id,
        taskId: task.id,
      }
    )
    expect(result).toMatchObject([
      {
        message: `${userOne.name} has been unassigned from the task "${task.name}" in the project "${projectOne.name}".`,
        type: NOTIFICATION_TYPE.PROJECT_UPDATE,
        projectId: projectOne.id,
        seen: false,
        triggeredBy: userOne.id,
        userId: userTwo.id,
        taskId: task.id,
      },
    ])
  })
  it('sends deleted project notification', async () => {
    const result = await deletedProject(
      { projectName: projectOne.name, triggeredByName: userOne.name },
      repository,
      [userTwo.id],
      {
        triggeredBy: userOne.id,
        projectId: projectOne.id,
      }
    )
    expect(result).toMatchObject([
      {
        message: `The project "${projectOne.name}" was deleted by ${userOne.name}.`,
        type: NOTIFICATION_TYPE.PROJECT_UPDATE,
        projectId: projectOne.id,
        seen: false,
        userId: userTwo.id,
      },
    ])
  })
})
