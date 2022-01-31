import { Spooders } from 'creeps'
import { carrier, Carrier } from 'creeps/carrier'
import { creepForName, isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { Hunter, hunter } from 'creeps/hunter'
import { TaskNames } from 'creeps/tasks'
import { creepPhase, taskForPriority } from 'creeps/tasks/taskPriority'
import {
  nestFind,
  nestGoalSpoods,
  nestMarker,
  oneOfStructures,
  sortByRange,
} from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { deserializePos } from 'utils/helpers'
import { hooks } from './hooks'

const createCarrierTask = (carrier: Carrier) => {
  const phase = creepPhase(carrier, [
    {
      name: 'fill',
      when: s => isCreepEmpty(s.name),
    },

    {
      name: 'deposit',
      when: s => isCreepFull(s.name),
    },
  ])

  if (!carrier.data?.huntingGround) return

  const huntingGround = deserializePos(carrier.data?.huntingGround)

  let task
  switch (phase) {
    case 'deposit':
      task = taskForPriority([
        {
          name: TaskNames.store,
          getTarget: () => {
            const stores = nestFind(carrier.nest, FIND_STRUCTURES, {
              filter: structure =>
                oneOfStructures(structure, [
                  STRUCTURE_SPAWN,
                  STRUCTURE_EXTENSION,
                ]) &&
                (structure as AnyStoreStructure).store.getFreeCapacity(
                  RESOURCE_ENERGY,
                ) > 0,
            })
            if (!stores.length) return null
            return sortByRange(stores, creepForName(carrier.name).pos)[0]?.id
          },
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

    case 'fill':
    default:
      task = taskForPriority([
        {
          name: TaskNames.pickUp,
          getTarget: () =>
            huntingGround
              .lookFor(LOOK_RESOURCES)
              .sort((a, b) => a.amount - b.amount)[0]?.id,
        },
        {
          name: TaskNames.withdraw,
          getTarget: () =>
            huntingGround
              .lookFor(LOOK_STRUCTURES)
              .filter(
                structure => structure.structureType === STRUCTURE_CONTAINER,
              )[0]?.id as Id<AnyStoreStructure>,
        },
      ])
      break
  }
  if (task) carrier.task = task
}

export const run: Goal['run'] = nest => {
  hooks(nest)

  const spoods = nestGoalSpoods(nest, GoalNames.hunting)
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
