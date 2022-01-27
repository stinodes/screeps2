import { Spooders } from 'creeps'
import { carrier, Carrier } from 'creeps/carrier'
import { isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { Hunter, hunter } from 'creeps/hunter'
import { Task, TaskNames } from 'creeps/tasks'
import { taskForPriority } from 'creeps/tasks/taskPriority'
import { nestFind, nestMarker, nestSpoods, oneOfStructures } from 'nest/helpers'
import { Goal } from 'nest/types'
import { deserializePos } from 'utils/helpers'
import { hooks } from './hooks'

const createCarrierTask = (carrier: Carrier) => {
  let nextTask: 'fill' | 'deposit' = 'fill'

  if (!carrier.data?.huntingGround) return

  const huntingGround = deserializePos(carrier.data?.huntingGround)

  if (isCreepFull(carrier.name)) nextTask = 'deposit'
  else if (isCreepEmpty(carrier.name)) nextTask = 'fill'
  else if ([TaskNames.pickUp, TaskNames.withdraw].includes(carrier.task?.name))
    nextTask = 'fill'
  else nextTask = 'deposit'

  let task
  switch (nextTask) {
    case 'fill':
      task = taskForPriority([
        {
          name: TaskNames.pickUp,
          getTarget: () =>
            huntingGround
              .lookFor(LOOK_RESOURCES)
              .sort((a, b) => a.amount - b.amount)[0],
        },
        {
          name: TaskNames.withdraw,
          getTarget: () =>
            huntingGround
              .lookFor(LOOK_STRUCTURES)
              .filter(
                structure => structure.structureType === STRUCTURE_CONTAINER,
              )[0] as AnyStoreStructure,
        },
      ])
      break
    case 'deposit':
      task = taskForPriority([
        {
          name: TaskNames.store,
          getTarget: () =>
            nestFind(carrier.nest, FIND_STRUCTURES, {
              filter: structure =>
                oneOfStructures(structure, [
                  STRUCTURE_SPAWN,
                  STRUCTURE_EXTENSION,
                ]) &&
                (structure as AnyStoreStructure).store.getFreeCapacity(
                  RESOURCE_ENERGY,
                ) > 0,
            }),
        },
        {
          name: TaskNames.store,
          getTarget: () =>
            nestFind(carrier.nest, FIND_STRUCTURES, {
              filter: { structureType: STRUCTURE_STORAGE },
            })[0],
        },
        {
          name: TaskNames.drop,
          getTarget: () => nestMarker(carrier.nest, 'storage'),
        },
      ])
      break
  }
  if (task) carrier.task = task
}

export const run: Goal['run'] = nest => {
  hooks(nest)

  const spoods = nestSpoods(nest)
  const carriers = spoods.filter(
    spood => spood.type === Spooders.carrier,
  ) as Carrier[]

  const carriersWithoutTask = carriers.filter(c => !c.task || c.task.complete)

  carriersWithoutTask.forEach(createCarrierTask)

  spoods.forEach(s => {
    switch (s.type) {
      case Spooders.hunter:
        hunter(s as Hunter)
        break
      case Spooders.carrier:
        carrier(s as Carrier)
        break
    }
  })
}
