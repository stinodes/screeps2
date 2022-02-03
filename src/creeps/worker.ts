import {LayEgg, Spooders} from 'creeps'
import {ColonyWorker} from './colonyWorker'
import {creepForName} from './helpers'
import {
  harvest,
  pickUp,
  repair,
  store,
  Task,
  TaskNames,
  upgrade,
  weave,
  withdraw,
} from './tasks'

export type WorkerTask =
  | Task<TaskNames.harvest, Source>
  | Task<TaskNames.pickUp, Resource>
  | Task<TaskNames.withdraw, AnyStoreStructure | Tombstone | Ruin>
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.upgrade, null, null>
  | Task<TaskNames.weave, ConstructionSite>
  | Task<TaskNames.repair, AnyStructure>

export type Worker = CreepMemory & {
  type: Spooders.worker

  task: WorkerTask

  data?: {
    upgrader?: boolean
    source?: Id<Source>
    phase?: 'gather' | 'use'
  }
}

export const layWorkerEgg: LayEgg<Worker['data']> = (
  goal,
  data,
  priority = 2,
) => ({
  type: Spooders.worker,
  body: {
    parts: {
      [WORK]: 1,
      [CARRY]: 1,
      [MOVE]: 1,
    },
    max: BODYPART_COST[WORK] * 8 + BODYPART_COST[CARRY] * 8 + BODYPART_COST[MOVE] * 8,
    grow: true,
  },
  goal,
  data: data,

  priority,
})

export const worker = ({name, task}: ColonyWorker | Worker) => {
  const creep = creepForName(name)

  switch (task?.name) {
    case TaskNames.harvest:
      return harvest(creep, task)
    case TaskNames.pickUp:
      return pickUp(creep, task)
    case TaskNames.withdraw:
      return withdraw(creep, task)
    case TaskNames.store:
      return store(creep, task)
    case TaskNames.weave:
      return weave(creep, task)
    case TaskNames.repair:
      return repair(creep, task)
    case TaskNames.upgrade:
      return upgrade(creep, task)
    default:
      ; (task as Task<any, any>).complete = true
      return task
  }
}
