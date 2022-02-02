import { LayEgg, Spooders } from 'creeps'
import { SerializedPosition } from 'utils/helpers'
import { Task, TaskNames } from './tasks'

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
  priority = 1,
) => ({
  type: Spooders.colonyCarrier,
  body: {
    parts: {
      [CARRY]: 7,
      [MOVE]: 4,
    },
    grow: true,
  },
  goal,
  data: data,

  priority,
})
