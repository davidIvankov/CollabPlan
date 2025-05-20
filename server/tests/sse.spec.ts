import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as sse from '../src/sse'

// Export userConnections from sse.ts for testing purposes
const { userConnections } = sse as any

function createMockRes() {
  return {
    write: vi.fn(),
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
    status: vi.fn(() => ({ end: vi.fn() })),
    end: vi.fn(),
    on: vi.fn(),
    headers: {},
  } as any
}

describe('SSE module', () => {
  beforeEach(() => {
    userConnections.clear()
  })

  it('addUserConnection and removeUserConnection', () => {
    const res = createMockRes()
    sse.addUserConnection('user1', res as any)
    expect(userConnections.get('user1')).toBe(res)
    sse.removeUserConnection('user1')
    expect(userConnections.has('user1')).toBe(false)
  })

  it('sendInvitationNotificationToUser writes correct data', () => {
    const res = createMockRes()
    sse.addUserConnection('user2', res as any)
    sse.sendInvitationNotificationToUser('user2')
    expect(res.write).toHaveBeenCalledWith(
      expect.stringContaining('INVITATION')
    )
  })

  it('sendNotificationToUsers writes correct data for each user', () => {
    const res1 = createMockRes()
    const res2 = createMockRes()
    sse.addUserConnection('user3', res1 as any)
    sse.addUserConnection('user4', res2 as any)
    sse.sendNotificationToUsers(['user3', 'user4'])
    expect(res1.write).toHaveBeenCalledWith(
      expect.stringContaining('PROJECT_NOTIFICATION')
    )
    expect(res2.write).toHaveBeenCalledWith(
      expect.stringContaining('PROJECT_NOTIFICATION')
    )
  })
})
