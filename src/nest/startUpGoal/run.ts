import { Spooders } from 'creeps'
import { creepForName, isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { spiderling, Spiderling, SpiderlingTask } from 'creeps/spiderling'
import { Task, TaskNames } from 'creeps/tasks'
import {
  getFreeSources,
  nestFind,
  nestGoalSpoods,
  oneOfStructures,
  sortByRange,
} from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { hooks } from './hooks'

export const getFreeSource = (nest: string, s: Spiderling) => {
  const sources = getFreeSources(nest)
  return sortByRange(sources, creepForName(s.name).pos)[0]
}

type TaskPriority<T extends Task<any, any, any>> = {
  name: T['name']
  getTarget?: () => undefined | null | T['target']
}
const taskForPriority = <T extends Task<any, any, any>>(
  prios: TaskPriority<T>[],
): T | null => {
  const prio = prios.find(prio => {
    return !prio.getTarget || prio.getTarget()
  })
  if (!prio) return null
  return { name: prio.name, target: prio.getTarget && prio.getTarget() } as T
}

const createSpiderlingTask = (
  { stores, sites }: { stores: AnyStoreStructure[]; sites: ConstructionSite[] },
  s: Spiderling,
) => {
  let nextTask
  if (isCreepEmpty(s.name)) nextTask = 'gather'
  else if (isCreepFull(s.name)) nextTask = 'use'
  if ([TaskNames.pickUp, TaskNames.harvest].includes(s.task?.name))
    nextTask = 'gather'
  else nextTask = 'use'

  let task: null | SpiderlingTask = null
  switch (nextTask) {
    case 'gather':
      task = taskForPriority([
        {
          name: TaskNames.pickUp,
          getTarget: () =>
            creepForName(s.name).pos.findClosestByPath(FIND_DROPPED_RESOURCES)
              ?.id,
        },
        {
          name: TaskNames.harvest,
          getTarget: () => getFreeSource(s.nest, s)?.id,
        },
      ])
      break
    case 'use':
      task = taskForPriority([
        {
          name: TaskNames.store,
          getTarget: () => stores[0]?.id,
        },
        {
          name: TaskNames.weave,
          getTarget: () => sites[0]?.id,
        },
        { name: TaskNames.upgrade },
      ])
      break
  }

  if (task) s.task = task
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
    createSpiderlingTask(
      { stores: unfilledStores, sites: constructionSites },
      s,
    )
  })

  spoods.forEach(spood => {
    if (spood.type === Spooders.spiderling) spiderling(spood as Spiderling)
  })
}
