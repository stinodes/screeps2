import {Spooders} from 'creeps'
import {creepForName, isCreepEmpty} from 'creeps/helpers'
import {Spiderling, spiderling, SpiderlingTask} from 'creeps/spiderling'
import {TaskNames} from 'creeps/tasks'
import {GoalNames} from 'nest'
import {nestFind, nestGoalSpoods, nestLevel, oneOfStructures} from './helpers'
import {Goal} from './types'

export const startUpGoal: Goal = {
  name: GoalNames.startUp,
  canCreate: () => true,
  isComplete: nest => {
    const extensions = nestFind(nest, FIND_STRUCTURES, {
      filter: {structureType: STRUCTURE_EXTENSION},
    })
    return nestLevel(nest) === 2 && extensions.length >= 5
  },
  eggs: (nest) => {
    const eggs = []
    const spoods = nestGoalSpoods(nest, GoalNames.startUp)
    const spiderlings = spoods.filter(s => s.type === Spooders.spiderling)

    if (spiderlings.length < 5) eggs.push(Spooders.spiderling)
    return eggs

  },

  run: (nest: string) => {
    const spoods = nestGoalSpoods(nest, GoalNames.startUp)
    const spiderlings = spoods.filter(s => s.type === Spooders.spiderling) as Spiderling[]
    const spiderlingsWithCompleteTask = spiderlings.filter(s => s.task.complete)

    const unfilledStores = nestFind(nest, FIND_STRUCTURES, {
      filter: (struct: AnyStoreStructure) =>
        oneOfStructures(struct, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) &&
        struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }) as AnyStoreStructure[]
    const constructionSites = nestFind(nest, FIND_CONSTRUCTION_SITES)

    const createNewSpiderlingTask = (): SpiderlingTask => {
      if (unfilledStores.length)
        return {
          name: TaskNames.store,
          target: unfilledStores[0].id
        }
      if (constructionSites.length)
        return {
          name: TaskNames.weave,
          target: constructionSites[0].id
        }

      return {name: TaskNames.upgrade, target: '' as Id<null>}
    }

    spiderlingsWithCompleteTask.forEach(s => {
      if (s.task.name === TaskNames.harvest) {
        s.task = createNewSpiderlingTask()
      }
      else {
        const creep = creepForName(s.name)
        const source = creep.pos.findClosestByPath(FIND_SOURCES)

        if (isCreepEmpty(s.name)) {
          s.task = createNewSpiderlingTask()
        }
        if (source)
          s.task = {
            name: TaskNames.harvest,
            target: source.id,
          }
      }
    })

    spoods.forEach(spood => {
      if (spood.type === Spooders.spiderling)
        spiderling(spood as Spiderling)
    })
  },
}
