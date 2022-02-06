import { Egg } from 'creeps'
import { nestLevel } from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { run } from './run'

export const settleGoal: Goal = {
  name: GoalNames.settle,
  canCreate: (nest: string) => {
    const level = nestLevel(nest)
    return level >= 4
  },
  isComplete: () => false,
  eggs: nest => {
    const eggs: Egg[] = []
    return eggs
  },

  run,
}
