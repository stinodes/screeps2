import { Spooders } from 'creeps'
import { Spiderling, spiderling } from 'creeps/spiderling'
import { GoalNames } from 'nest'
import { nestFind, nestGoalSpoods, nestLevel } from './helpers'
import { Goal } from './types'

export const startUpGoal: Goal = {
  name: GoalNames.startUp,
  canCreate: () => true,
  isComplete: nest => {
    const extensions = nestFind(nest, FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION },
    })
    return nestLevel(nest) === 2 && extensions.length >= 5
  },
  requestJobs: nest => [],

  run: (nest: string) => {
    const spoods = nestGoalSpoods(nest, GoalNames.startUp)
    spoods.forEach(spood => {
      if (spood.behavior === Spooders.spiderling)
        spiderling(spood as Spiderling)
    })
  },
}
