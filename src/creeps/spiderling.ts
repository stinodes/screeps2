import { Spooders } from 'creeps'

export type Spiderling = CreepMemory & {
  type: Spooders.spiderling
  source: Id<Source>
}

export const spiderling = (creep: Spiderling) => {}
