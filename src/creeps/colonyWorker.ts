import { LayEgg, Spooders } from 'creeps'
import { Task, TaskNames } from './tasks'

export type ColonyWorkerTask =
  | Task<TaskNames.harvest, Source>
  | Task<TaskNames.pickUp, Resource>
  | Task<TaskNames.withdraw, AnyStoreStructure | Tombstone | Ruin>
  | Task<TaskNames.upgrade, null, null>
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
  priority = 3,
) => ({
  type: Spooders.colonyWorker,
  body: {
    parts: {
      [WORK]: 1,
      [CARRY]: 1,
      [MOVE]: 2,
    },
    max:
      BODYPART_COST[WORK] * 3 +
      BODYPART_COST[CARRY] * 3 +
      BODYPART_COST[MOVE] * 6,
    grow: true,
  },
  goal,
  data: data,

  priority,
})
