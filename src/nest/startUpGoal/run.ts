import { Spooders } from 'creeps'
import { creepForName, isCreepEmpty } from 'creeps/helpers'
import { spiderling, Spiderling, SpiderlingTask } from 'creeps/spiderling'
import { TaskNames } from 'creeps/tasks'
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

const createNewSpiderlingTask = (
  { stores, sites }: { stores: AnyStoreStructure[]; sites: ConstructionSite[] },
  s: Spiderling,
): SpiderlingTask => {
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

  return { name: TaskNames.upgrade, target: '' as Id<null> }
}

const getFreeSource = (nest: string, s: Spiderling) => {
  const room = nestRoom(nest)
  const sources = room.find(FIND_SOURCES).filter(source => {
    const adjSq = getEmptyAdjecentSquares(source.pos)
    const spoods = (nestSpoods(nest) as Spiderling[]).filter(
      s => s.task?.target === source.id,
    )
    return spoods.length <= adjSq.length
  })
  return sortByRange(sources, creepForName(s.name).pos)[0]
}

export const run: Goal['run'] = (nest: string) => {
  hooks(nest)

  const spoods = nestGoalSpoods(nest, GoalNames.startUp)
  const spiderlings = spoods.filter(
    s => s.type === Spooders.spiderling,
  ) as Spiderling[]
  const spiderlingsWithCompleteTask = spiderlings.filter(
    s => !s.task || s.task.complete,
  )

  const unfilledStores = nestFind(nest, FIND_STRUCTURES, {
    filter: (struct: AnyStoreStructure) =>
      oneOfStructures(struct, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) &&
      struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  }) as AnyStoreStructure[]
  const constructionSites = nestFind(nest, FIND_CONSTRUCTION_SITES)

  spiderlingsWithCompleteTask.forEach(s => {
    if (s.task && s.task.name === TaskNames.harvest) {
      if (s.data?.upgrader)
        s.task = { name: TaskNames.upgrade, target: '' as Id<null> }
      else
        s.task = createNewSpiderlingTask(
          { stores: unfilledStores, sites: constructionSites },
          s,
        )
    } else {
      const source = getFreeSource(nest, s)

      if (isCreepEmpty(s.name)) {
        s.task = createNewSpiderlingTask(
          { stores: unfilledStores, sites: constructionSites },
          s,
        )
      }
      if (source) {
        s.task = {
          name: TaskNames.harvest,
          target: source.id,
        }
      }
    }
  })

  spoods.forEach(spood => {
    if (spood.type === Spooders.spiderling) spiderling(spood as Spiderling)
  })
}
