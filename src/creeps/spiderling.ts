import { LayEgg, Spooders } from 'creeps'
import { creepForName } from './helpers'
import { harvest, store, Task, TaskNames, upgrade, weave } from './tasks'

export type SpiderlingTask =
  | Task<TaskNames.harvest, Source>
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.upgrade, null>
  | Task<TaskNames.weave, ConstructionSite>

export type Spiderling = CreepMemory & {
  type: Spooders.spiderling

  task: SpiderlingTask

  data?: {
    upgrader?: boolean
    source?: Id<Source>
  }
}

export const laySpiderlingEgg: LayEgg<Spiderling['data']> = data => ({
  type: Spooders.spiderling,
  body: {
    parts: {
      [WORK]: 2,
      [CARRY]: 1,
      [MOVE]: 1,
    },
  },
  data: data,
})

export const spiderling = ({ name, task }: Spiderling) => {
  const creep = creepForName(name)

  switch (task?.name) {
    case TaskNames.harvest:
      return harvest(creep, task)
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
