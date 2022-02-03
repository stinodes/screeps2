import {LayEgg, Spooders} from 'creeps'
import {SerializedPosition} from 'utils/helpers'
import {Task, TaskNames} from './tasks'

export type ColonyCarrierTask =
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.withdraw, AnyStoreStructure>
  | Task<TaskNames.pickUp, Resource>
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
    max: BODYPART_COST[CARRY] * 14 + BODYPART_COST[MOVE] * 14,
    grow: true,
  },
  goal,
  data: data,

  priority,
})
