import { Spooders } from 'creeps'
import { SerializedPosition } from 'utils/helpers'
import { creepForName } from './helpers'
import { pickUp, store, Task, TaskNames, withdraw } from './tasks'

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
  }
}

export const carrier = ({ task, name }: Carrier) => {
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
  }
}
