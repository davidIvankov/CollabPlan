import type { Response, Request } from 'express'
import jwt from 'jsonwebtoken'
import { parseTokenPayload } from './trpc/tokenPayload'
import config from './config'

const userConnections = new Map<string, Response>()
export function addUserConnection(userId: string, res: Response) {
  userConnections.set(userId, res)
}

export function removeUserConnection(userId: string) {
  userConnections.delete(userId)
}

export function sendInvitationNotificationToUser(userId: string) {
  const connection = userConnections.get(userId)
  if (connection) {
    connection.write(`data: ${JSON.stringify({ type: 'INVITATION' })}\n\n`)
  }
}

export function sendNotificationToUsers(userIds: string[]) {
  userIds.forEach((userId) => {
    const connection = userConnections.get(userId)
    if (connection) {
      connection.write(
        `data: ${JSON.stringify({ type: 'PROJECT_NOTIFICATION' })}\n\n`
      )
    }
  })
}

export function sseNotificationsHandler(req: Request, res: Response) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).end('Missing or invalid Authorization header')
    return
  }

  const token = authHeader.split(' ')[1]

  let userId: string
  try {
    const decoded = jwt.verify(token, config.auth.tokenKey)
    const { user } = parseTokenPayload(decoded)
    userId = user.id
  } catch {
    res.status(401).end('Invalid token')
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  addUserConnection(userId, res)

  req.on('close', () => {
    removeUserConnection(userId)
  })
}

// Only export for testing
export { userConnections }
