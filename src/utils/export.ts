import { prisma } from "../server/db/client.js";
import * as fs from 'fs';

async function exportDB(id: string) {
  return await prisma.flock.findMany({
    where: {
      id: id,
    },
    include: {
      logs: true,
      breeds: true,
      owner: {
        include: {
          accounts: true,
        },
      },
    },
  });
}

(async () => {
  const res = await exportDB("cl6l74hjz0057u2pe8bdu24ib");

  fs.writeFileSync('./data.json', JSON.stringify(res));

  console.log(res);
})();
