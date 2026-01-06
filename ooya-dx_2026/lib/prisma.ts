import { PrismaClient } from '@prisma/client'

/**
 * PrismaClient のシングルトン化
 * - Next.js の開発環境ではホットリロードによりインスタンスが複数生成されやすいため、
 *   `globalThis` に保存して再利用します。
 * - 本番環境では通常通り単一生成で問題ありません。
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
