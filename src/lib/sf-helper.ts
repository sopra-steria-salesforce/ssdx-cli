import { Connection, Org } from '@salesforce/core';

// TODO: more somewhere global without needing to specify target org

async function getConnection(targetOrg: string): Promise<Connection> {
  return (
    await Org.create({
      aliasOrUsername: targetOrg,
    })
  ).getConnection();
}

export async function queryRecord(query: string, targetOrg: string) {
  const conn = await getConnection(targetOrg);
  return await conn.query(query);
}
