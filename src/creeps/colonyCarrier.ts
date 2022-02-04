import { LayEgg, Spooders } from 'creeps'
import { SerializedPosition } from 'utils/helpers'
import { Task, TaskNames } from './tasks'

export type ColonyCarrierTask =
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.withdraw, AnyStoreStructure | Tombstone | Ruin>
  | Task<TaskNames.pickUp, Resource>
  | Task<TaskNames.moveToRoom, null, string>
  | Task<TaskNames.drop, null, string>

export type ColonyCarrier = CreepMemory & {
  type: Spooders.colonyCarrier
  task: ColonyCarrierTask
  data?: {
    huntingGround: SerializedPosition
    phase?: 'fill' | 'deposit'
    colony: string
  }
}

export const layColonyCarrierEgg: LayEgg<ColonyCarrier['data']> = (
  goal,
  data,
  priority = 3,
) => ({
  type: Spooders.colonyCarrier,
  body: {
    parts: {
      [CARRY]: 1,
      [MOVE]: 1,
    },
    max: BODYPART_COST[CARRY] * 16 * 2 + BODYPART_COST[MOVE] * 16 * 2,
    grow: true,
  },
  goal,
  data: data,

  priority,
})
