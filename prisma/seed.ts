import { PrismaClient } from '@prisma/client'
import { flockData } from './data'

const prisma = new PrismaClient();

const run = async () => {
  await Promise.all(
    flockData.map(async (flock) => {
      return prisma.flock.upsert({
        
        where: { id: flock.id },
        update: {},
        create: {
            id: flock.id,
            name: flock.name,
            description: flock.description,
            imageUrl: flock.imageUrl,
            type: flock.type,
            // userId: undefined,
            // userId: flock.userId,
            logs: {
                create: flock.logs.map((log) => ({
                    id: log.id,
                    date: log.date,
                    count: log.count,
                    // flockId: log.flockId,
                    notes: log.notes,
                })),
            },
            breeds: {
                create: flock.breeds.map((breed) => ({
                    id: breed.id,
                    name: breed.name,
                    description: breed.description,
                    count: breed.count,
                    imageUrl: breed.imageUrl,
                    averageProduction: breed.averageProduction,
                    // flockId: breed.flockId,
                })),
            },
            owner: {
                create: {
                    ...flock.owner,
                    accounts: {
                        create: flock.owner.accounts.map((acct) => ({
                            id: acct.id,
                            // userId: acct.userId,
                            type: acct.type,
                            provider: acct.provider,
                            providerAccountId: acct.providerAccountId,
                            refresh_token: acct.refresh_token,
                            access_token: acct.access_token,
                            expires_at: acct.expires_at,
                            token_type: acct.token_type,
                            scope: acct.scope,
                            id_token: acct.id_token,
                            session_state: acct.session_state
                        })),
                    }
                }
            }
        },
      })
    })
  )
}

(async () => {
    const res = await run();

    console.log(res);
    
})()