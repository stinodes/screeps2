import {LayEgg, Spooders} from 'creeps'
import {SerializedPosition} from 'utils/helpers'
import {ColonyCarrier} from './colonyCarrier'
import {creepForName} from './helpers'
import {drop, pickUp, store, Task, TaskNames, withdraw} from './tasks'

export type CarrierTask =
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.withdraw, AnyStoreStructure>
  | Task<TaskNames.pickUp, Resource>
  | Task<TaskNames.drop, null, string>

export type Carrier = CreepMemory & {
  type: Spooders.carrier
  task: CarrierTask
  data?: {
    huntingGround: SerializedPosition
    phase?: 'fill' | 'deposit'
  }
}

export const layCarrierEgg: LayEgg<Carrier['data']> = (
  goal,
  data,
  priority = 1,
) => ({
  type: Spooders.carrier,
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

export const carrier = ({task, name}: ColonyCarrier | Carrier) => {
  const creep = creepForName(name)
  switch (task?.name) {
    case TaskNames.pickUp:
      pickUp(creep, task)
      break
    case TaskNames.withdraw:
      withdraw(creep, task)
      break
    case TaskNames.store:
      store(creep, task)
      break
    case TaskNames.drop:
      drop(creep, task)
      break
  }
}
