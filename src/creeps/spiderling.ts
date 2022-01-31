import { LayEgg, Spooders } from 'creeps'
import { creepForName } from './helpers'
import {
  harvest,
  pickUp,
  store,
  Task,
  TaskNames,
  upgrade,
  weave,
} from './tasks'

export type SpiderlingTask =
  | Task<TaskNames.harvest, Source>
  | Task<TaskNames.pickUp, Resource>
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.upgrade, null, null>
  | Task<TaskNames.weave, ConstructionSite>

export type Spiderling = CreepMemory & {
  type: Spooders.spiderling

  task: SpiderlingTask

  data?: {
    upgrader?: boolean
    source?: Id<Source>
    phase?: 'gather' | 'use'
  }
}

export const laySpiderlingEgg: LayEgg<Spiderling['data']> = (
  goal,
  data,
  priority = 1,
) => ({
  type: Spooders.spiderling,
  body: {
    parts: {
      [WORK]: 2,
      [CARRY]: 1,
      [MOVE]: 1,
    },
  },
  goal,
  data: data,

  priority,
})

export const spiderling = ({ name, task }: Spiderling) => {
  const creep = creepForName(name)

  switch (task?.name) {
    case TaskNames.harvest:
      return harvest(creep, task)
    case TaskNames.pickUp:
      return pickUp(creep, task)
    case TaskNames.store:
      return store(creep, task)
    case TaskNames.weave:
      return weave(creep, task)
    case TaskNames.upgrade:
      return upgrade(creep, task)
    default:
      ;(task as Task<any, any>).complete = true
      return task
  }
}
