import { Spooders } from 'creeps'
import { laySpiderlingEgg, Spiderling } from 'creeps/spiderling'
import { nestFind, nestGoalSpoods, nestLevel } from '../helpers'
import { GoalNames, Goal } from '../types'
import { run } from './run'

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
    const requiredSpooders = Math.max(
      minSpiderlings,
      Math.min(maxSpiderlings, requiredProgress / 1000 + 2),
    )

    if (spiderlings.length < 2)
      eggs.push(laySpiderlingEgg(GoalNames.startUp, {}))
    else if (!hasUpgrader)
      eggs.push(laySpiderlingEgg(GoalNames.startUp, { upgrader: true }))
    else if (spiderlings.length < requiredSpooders)
      eggs.push(laySpiderlingEgg(GoalNames.startUp, {}))
    return eggs
  },

  run,
}
