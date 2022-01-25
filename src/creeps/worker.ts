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

export type WorkerTask =
  | Task<TaskNames.harvest, Source>
  | Task<TaskNames.pickUp, Resource>
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.upgrade, null>
  | Task<TaskNames.weave, ConstructionSite>

export type Worker = CreepMemory & {
  type: Spooders.worker

  task: WorkerTask

  data?: {
    upgrader?: boolean
    source?: Id<Source>
  }
}

export const layWorkerEgg: LayEgg<Worker['data']> = data => ({
  type: Spooders.worker,
  body: {
    parts: {
      [WORK]: 2,
      [CARRY]: 1,
      [MOVE]: 1,
    },
  },
  data: data,
})

export const worker = ({ name, task }: Worker) => {
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
