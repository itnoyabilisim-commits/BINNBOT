export type RobotCreate = {
  symbol: string;
  side: 'buy'|'sell'|'long'|'short';
};
export async function createRobot(base = 'http://localhost:8080', body: RobotCreate) {
  const res = await fetch(base + '/robots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)});
  if (!res.ok) throw new Error('createRobot failed');
  return await res.json().catch(()=>({ok:true}));
}
