import { Spooders } from 'creeps'
import { creepForName, isCreepEmpty } from 'creeps/helpers'
import { Spiderling, spiderling, SpiderlingTask } from 'creeps/spiderling'
import { TaskNames } from 'creeps/tasks'
import {
  getAdjecentSquares,
  getEmptyAdjecentSquares,
  nestFind,
  nestGoalSpoods,
  nestHooksForGoal,
  nestLevel,
  nestMem,
  nestRoom,
  nestSpoods,
  oneOfStructures,
  relativePosCurry,
  sortByRange,
} from './helpers'
import { GoalNames, Goal } from './types'

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

const hooks = (nest: string) => {
  const nestObj = nestMem(nest)
  if (!nestObj.hooks[startUpGoal.name]) {
    nestObj.hooks[startUpGoal.name] = {}
  }
  buildRoads(nest)
}

const buildRoads = (nest: string) => {
  const maxRoadLength = 10
  const startUpHooks = nestHooksForGoal(nest, GoalNames.startUp)
  if (startUpHooks && !startUpHooks.initRoads) {
    const spawn = nestFind(nest, FIND_MY_SPAWNS)[0]
    const rsPos = relativePosCurry(spawn.pos)
    const spawnRoadPositions = [
      rsPos(1, 0),
      rsPos(0, 1),
      rsPos(-1, 0),
      rsPos(0, -1),
    ]
    spawnRoadPositions.forEach(pos =>
      pos.createConstructionSite(STRUCTURE_ROAD),
    )

    const sources = nestFind(nest, FIND_SOURCES).forEach(source => {
      const path = spawn.pos.findPathTo(source)
      path
        .slice(0, maxRoadLength)
        .forEach(pos =>
          new RoomPosition(pos.x, pos.y, nest).createConstructionSite(
            STRUCTURE_ROAD,
          ),
        )
    })

    startUpHooks.initRoads = true
  }
}

type StartUpHooks = {
  initRoads?: boolean
  initExtensions?: boolean
}

export const startUpGoal: Goal = {
  name: GoalNames.startUp,
  canCreate: () => true,
  isComplete: nest => {
    const extensions = nestFind(nest, FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION },
    })
    return nestLevel(nest) >= 2 && extensions.length >= 5
  },
  eggs: nest => {
    const minSpiderlings = 5
    const maxSpiderlings = 8

    const eggs = []
    const spoods = nestGoalSpoods(nest, GoalNames.startUp) as Spiderling[]
    const spiderlings = spoods.filter(s => s.type === Spooders.spiderling)
    const hasUpgrader = spoods.some(s => s.data?.upgrader)
    const requiredProgress = nestFind(nest, FIND_CONSTRUCTION_SITES).reduce(
      (total, site) => {
        return total + (site.progressTotal - site.progress)
      },
      0,
    )

    /**
     * TODO: Add workload factor (e.g. n.o. construction sites)
     */

    const requiredSpooders = Math.max(
      minSpiderlings,
      Math.min(maxSpiderlings, requiredProgress / 1000 + 2),
    )

    if (spiderlings.length < 2)
      eggs.push({ type: Spooders.spiderling, data: {} })
    else if (!hasUpgrader)
      eggs.push({ type: Spooders.spiderling, data: { upgrader: true } })
    else if (spiderlings.length < requiredSpooders)
      eggs.push({ type: Spooders.spiderling, data: {} })
    return eggs
  },

  run: (nest: string) => {
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
        const creep = creepForName(s.name)
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
  },
}
