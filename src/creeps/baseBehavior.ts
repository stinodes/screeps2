import { creepForName } from './helpers'
import {
  AllTasks,
  drop,
  harvest,
  moveToRoom,
  pickUp,
  repair,
  store,
  Task,
  TaskNames,
  upgrade,
  weave,
  withdraw,
} from './tasks'

export const baseSpider = ({
  name,
  task,
}: CreepMemory & { task: AllTasks }) => {
  const creep = creepForName(name)

  switch (task?.name) {
    case TaskNames.harvest:
      return harvest(creep, task)
    case TaskNames.pickUp:
      return pickUp(creep, task)
    case TaskNames.drop:
      return drop(creep, task)
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
    case TaskNames.moveToRoom:
      return moveToRoom(creep, task)
    default:
      ;(task as Task<any, any>).complete = true
      return task
  }
}
