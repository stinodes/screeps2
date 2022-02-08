import { Spooders } from 'creeps'
import { baseSpider } from 'creeps/baseBehavior'
import { creepForName, isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { Spiderling, SpiderlingTask } from 'creeps/spiderling'
import { TaskNames } from 'creeps/tasks'
import {
  harvestFreeSourceTask,
  pickUpResourceTask,
  storeExtensionsTask,
  upgradeControllerTask,
  weaveTask,
} from 'creeps/tasks/taskCreators'
import { taskForPriority } from 'creeps/tasks/taskPriority'
import { getFreeSources, nestGoalSpoods, sortByRange } from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { hooks } from './hooks'

export const getFreeSource = (nest: string, s: Spiderling) => {
  const sources = getFreeSources(nest)
  return sortByRange(sources, creepForName(s.name).pos)[0]
}

const createSpiderlingTask = (s: Spiderling) => {
  let nextTask
  if (isCreepEmpty(s.name)) nextTask = 'gather'
  else if (isCreepFull(s.name)) nextTask = 'use'
  else if ([TaskNames.pickUp, TaskNames.harvest].includes(s.task?.name))
    nextTask = 'gather'
  else nextTask = 'use'

  let task: null | SpiderlingTask = null
  switch (nextTask) {
    case 'use':
      if (s.data?.upgrader) task = { name: TaskNames.upgrade, target: null }
      else
        task = taskForPriority<SpiderlingTask>([
          storeExtensionsTask(s),
          weaveTask(s),
          upgradeControllerTask(s),
        ])
      break
    case 'gather':
    default:
      task = taskForPriority<SpiderlingTask>([
        pickUpResourceTask(s),
        harvestFreeSourceTask(s),
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

  spiderlingsWithCompleteTask.forEach(s => {
    createSpiderlingTask(s)
  })

  spoods.forEach(spood => {
    if (spood.type === Spooders.spiderling) baseSpider(spood as Spiderling)
  })
}
