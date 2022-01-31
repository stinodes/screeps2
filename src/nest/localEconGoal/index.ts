import { layWorkerEgg, Worker } from 'creeps/worker'
import { nestFind, nestGoalData, nestGoalSpoods, nestLevel } from '../helpers'
import { GoalNames, Goal } from '../types'
import { LocalEconData } from './hooks'
import { run } from './run'

export const localEconGoal: Goal = {
  name: GoalNames.localEcon,
  canCreate: nest => {
    const extensions = nestFind(nest, FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION },
    })
    return nestLevel(nest) >= 2 && extensions.length >= 5
  },
  isComplete: () => false,
  eggs: nest => {
    const data = nestGoalData(nest, GoalNames.localEcon) as LocalEconData
    const spoods = nestGoalSpoods(nest, GoalNames.localEcon) as Worker[]

    const upgraders = spoods.filter(s => s.data?.upgrader)
    const nUpgraders = 4
    const minWorkers = 1
    const maxWorkers = 6

    const requiredProgress = nestFind(nest, FIND_CONSTRUCTION_SITES).reduce(
      (total, site) => {
        return total + (site.progressTotal - site.progress)
      },
      0,
    )
    const requiredSpooders = Math.max(
      minWorkers + nUpgraders,
      Math.min(maxWorkers + nUpgraders, requiredProgress / 1000 + 2),
    )

    const eggs = []

    if (data.status === 'unhealthy' && spoods.length < 2) {
      const egg = layWorkerEgg(GoalNames.localEcon, {}, 0)
      egg.body.grow = false
      eggs.push(egg)
    } else if (upgraders.length < nUpgraders)
      eggs.push(layWorkerEgg(GoalNames.localEcon, { upgrader: true }, 2))
    else if (spoods.length < requiredSpooders)
      eggs.push(layWorkerEgg(GoalNames.localEcon, {}, 2))

    return eggs
  },

  run,
}
