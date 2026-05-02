// Query your database using the Accelerate Client extension
import 'dotenv/config'

import { PrismaClient } from './generated/prisma/client.js'
import { withAccelerate } from '@prisma/extension-accelerate'

const accelerateUrl = process.env.DATABASE_URL
if (!accelerateUrl) {
  throw new Error(
    'Missing DATABASE_URL. Set your Prisma Accelerate URL in .env.local or environment variables.'
  )
}

const prisma = new PrismaClient({
  accelerateUrl,
}).$extends(withAccelerate())

// Example query to create a user based on the example schema
async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
    },
  })

  console.log(user)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
