import { Spooders } from 'creeps'
import { carrier, Carrier } from 'creeps/carrier'
import { isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { Hunter, hunter } from 'creeps/hunter'
import { Task, TaskNames } from 'creeps/tasks'
import { nestFind, nestMarker, nestSpoods, oneOfStructures } from 'nest/helpers'
import { Goal } from 'nest/types'
import { deserializePos } from 'utils/helpers'
import { hooks } from './hooks'

const createCarrierGatherTask = (
  carrier: Carrier,
):
  | null
  | Task<TaskNames.pickUp, Resource>
  | Task<TaskNames.withdraw, AnyStoreStructure> => {
  if (!carrier.data) return null

  const pos = deserializePos(carrier.data?.huntingGround)
  const resource = pos
    .lookFor(LOOK_RESOURCES)
    .sort((a, b) => a.amount - b.amount)[0]
  const container = pos
    .lookFor(LOOK_STRUCTURES)
    .filter(
      structure => structure.structureType === STRUCTURE_CONTAINER,
    )[0] as AnyStoreStructure

  if (resource) return { name: TaskNames.pickUp, target: resource.id }
  else if (container) return { name: TaskNames.withdraw, target: container.id }

  return null
}

const createCarrierStoreTask = (
  carrier: Carrier,
):
  | null
  | Task<TaskNames.store, AnyStoreStructure>
  | Task<TaskNames.drop, null, string> => {
  const sourcesAndExtensions = nestFind(carrier.nest, FIND_STRUCTURES, {
    filter: structure =>
      oneOfStructures(structure, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) &&
      (structure as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) >
        0,
  }) as (StructureSpawn | StructureExtension)[]
  const storage = nestFind(carrier.nest, FIND_STRUCTURES, {
    filter: { structureType: STRUCTURE_STORAGE },
  })[0] as StructureStorage | void

  if (sourcesAndExtensions.length)
    return { name: TaskNames.store, target: sourcesAndExtensions[0].id }

  if (storage) return { name: TaskNames.store, target: storage.id }

  const storagePos = nestMarker(carrier.nest, 'storage')
  return { name: TaskNames.drop, target: storagePos }
}

const createCarrierTask = (carrier: Carrier) => {
  let nextTask: 'fill' | 'deposit' = 'fill'

  if (isCreepFull(carrier.name)) nextTask = 'deposit'
  else if (isCreepEmpty(carrier.name)) nextTask = 'fill'
  else if ([TaskNames.pickUp, TaskNames.withdraw].includes(carrier.task?.name))
    nextTask = 'fill'
  else nextTask = 'deposit'

  let task
  switch (nextTask) {
    case 'fill':
      task = createCarrierGatherTask(carrier)
      break
    case 'deposit':
      task = createCarrierStoreTask(carrier)
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
