import { LayEgg, Spooders } from 'creeps'
import { Task, TaskNames } from './tasks'

export type ColonyWorkerTask =
  | Task<TaskNames.harvest, Source>
  | Task<TaskNames.pickUp, Resource>
  | Task<TaskNames.withdraw, AnyStoreStructure | Tombstone | Ruin>
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.weave, ConstructionSite>
  | Task<TaskNames.repair, AnyStructure>

export type ColonyWorker = CreepMemory & {
  type: Spooders.colonyWorker

  task: ColonyWorkerTask

  data?: {
    phase?: 'gather' | 'use'
    colony: string
  }
}

export const layColonyWorkerEgg: LayEgg<ColonyWorker['data']> = (
  goal,
  data,
  priority = 2,
) => ({
  type: Spooders.colonyWorker,
  body: {
    parts: {
      [WORK]: 1,
      [CARRY]: 1,
      [MOVE]: 1,
    },
    grow: true,
  },
  goal,
  data: data,

  priority,
})
