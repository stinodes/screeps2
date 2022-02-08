import {Egg} from 'creeps'
import {nestLevel} from 'nest/helpers'
import {Goal, GoalNames} from 'nest/types'
import {run} from './run'

export const settleGoal: Goal = {
  name: GoalNames.settle,
  canCreate: (nest: string) => {
    const level = nestLevel(nest)
    const anySettleNest = Object.values(Memory.nests).some(n => n.status === 'settling')
    return level >= 4 && anySettleNest
  },
  isComplete: () => {
    return false
  },
  eggs: nest => {
    const eggs: Egg[] = []
    return eggs
  },

  run,
}
