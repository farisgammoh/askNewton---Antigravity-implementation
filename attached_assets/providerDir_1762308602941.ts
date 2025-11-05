export async function inNetworkHits(planNetwork:string[], requested:string[]): Promise<string[]>{
  const set = new Set(planNetwork.map(n => n.toLowerCase()))
  return requested.filter(r => set.has(r.toLowerCase()))
}
