import Redis, { Redis as RedisClient } from 'ioredis'
import { MemberRepository } from './member-repository'
import { Member, Members } from '../entities'

export class RedisHandleError extends Error {}

export class RedisMemberRepository implements MemberRepository {
  private readonly client: RedisClient

  constructor(args: { host?: string; port?: number } | { client: RedisClient }) {
    if ('client' in args) {
      this.client = args.client
    } else {
      this.client = new Redis(args)
    }
  }

  async getAll(): Promise<Members> {
    try {
      const historyMemberIds = await this.client.keys('*')
      return this.buildMembers(historyMemberIds)
    } catch (e) {
      throw new RedisHandleError(e?.message || 'Failed to get the members data on Redis.')
    }
  }

  async exists(memberId: string): Promise<boolean> {
    try {
      return !!(await this.client.exists(memberId))
    } catch (e) {
      throw new RedisHandleError(e?.message || 'Failed to check the member exists on Redis.')
    }
  }

  async add(members?: Member | Members): Promise<void> {
    if (!members) return Promise.resolve()

    try {
      const memberIds = members instanceof Member ? [members.id] : members.toIds()
      if (memberIds.length) {
        const params = memberIds.reduce((arr: string[], memberId) => [...arr, memberId, ''], [])
        this.client.mset(params)
      }
    } catch (e) {
      throw new RedisHandleError(e?.message || 'Failed to save the members data on Redis.')
    }
  }

  async remove(members?: Member | Members): Promise<void> {
    if (!members) return Promise.resolve()

    try {
      const memberIds = members instanceof Member ? [members.id] : members.toIds()
      if (memberIds.length) {
        await this.client.del(memberIds)
      }
    } catch (e) {
      throw new RedisHandleError(e?.message || 'Failed to delete the members data on Redis.')
    }
  }

  async flush(): Promise<void> {
    try {
      this.client.flushdb()
    } catch (e) {
      throw new RedisHandleError(e?.message || 'Failed to flush the members data on Redis.')
    }
  }

  private buildMembers(historyMemberIds: string[]): Members {
    const args = historyMemberIds.map((id) => new Member(id))
    return new Members(args)
  }
}
