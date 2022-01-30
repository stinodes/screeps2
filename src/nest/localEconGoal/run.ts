import { Spooders } from 'creeps'
import { creepForName, isCreepEmpty } from 'creeps/helpers'
import { TaskNames } from 'creeps/tasks'
import { Worker, worker, WorkerTask } from 'creeps/worker'
import {
  getEmptyAdjecentSquares,
  nestFind,
  nestGoalSpoods,
  nestRoom,
  nestSpoods,
  oneOfStructures,
  sortByRange,
} from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { hooks } from './hooks'

const createNewWorkerTask = (
  { stores, sites }: { stores: AnyStoreStructure[]; sites: ConstructionSite[] },
  s: Worker,
): WorkerTask => {
  const creep = creepForName(s.name)
  if (stores.length) {
    const sortedStores = sortByRange(stores, creep.pos)
    return {
      name: TaskNames.store,
      target: sortedStores[0].id,
    }
  }
  if (sites.length) {
    const sortedSites = sortByRange(sites, creep.pos)
    return {
      name: TaskNames.weave,
      target: sortedSites[0].id,
    }
  }

  return { name: TaskNames.upgrade, target: null }
}

const getFreeSource = (nest: string, s: Worker) => {
  const room = nestRoom(nest)
  const sources = room.find(FIND_SOURCES).filter(source => {
    const adjSq = getEmptyAdjecentSquares(source.pos)
    const spoods = (nestSpoods(nest) as Worker[]).filter(
      s => s.task?.target === source.id,
    )
    return spoods.length <= adjSq.length
  })
  return sortByRange(sources, creepForName(s.name).pos)[0]
}

export const run: Goal['run'] = (nest: string) => {
  hooks(nest)

  const spoods = nestGoalSpoods(nest, GoalNames.localEcon)
  const workers = spoods.filter(s => s.type === Spooders.worker) as Worker[]
  const workersWithCompleteTask = workers.filter(
    s => !s.task || s.task.complete,
  )

  const unfilledStores = nestFind(nest, FIND_STRUCTURES, {
    filter: (struct: AnyStoreStructure) =>
      oneOfStructures(struct, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) &&
      struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  }) as AnyStoreStructure[]
  const constructionSites = nestFind(nest, FIND_CONSTRUCTION_SITES)

  workersWithCompleteTask.forEach(s => {
    if (s.task && [TaskNames.harvest, TaskNames.pickUp].includes(s.task.name)) {
      if (s.data?.upgrader) s.task = { name: TaskNames.upgrade, target: null }
      else
        s.task = createNewWorkerTask(
          { stores: unfilledStores, sites: constructionSites },
          s,
        )
    } else {
      const source = getFreeSource(nest, s)
      const resource = creepForName(s.name).pos.findClosestByPath(
        FIND_DROPPED_RESOURCES,
      )

      if (!isCreepEmpty(s.name)) {
        s.task = createNewWorkerTask(
          { stores: unfilledStores, sites: constructionSites },
          s,
        )
      } else if (resource) {
        s.task = {
          name: TaskNames.pickUp,
          target: resource.id,
        }
      } else if (source) {
        s.task = {
          name: TaskNames.harvest,
          target: source.id,
        }
      }
    }
  })

  spoods.forEach(spood => {
    if (spood.type === Spooders.worker) worker(spood as Worker)
  })
}
