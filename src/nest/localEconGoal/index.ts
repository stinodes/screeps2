import {layWorkerEgg} from 'creeps/worker'
import {nestFind, nestGoalData, nestLevel} from '../helpers'
import {GoalNames, Goal} from '../types'
import {LocalEconData} from './hooks'
import {run} from './run'

export const localEconGoal: Goal = {
  name: GoalNames.localEcon,
  canCreate: nest => {
    const extensions = nestFind(nest, FIND_STRUCTURES, {
      filter: {structureType: STRUCTURE_EXTENSION},
    })
    return nestLevel(nest) >= 2 && extensions.length >= 5
  },
  isComplete: () => false,
  eggs: nest => {
    const data = nestGoalData(nest, GoalNames.localEcon) as LocalEconData
    const eggs = []

    if (data.status === 'unhealthy')
      eggs.push(layWorkerEgg(GoalNames.localEcon, {}, 0))

    else eggs.push(layWorkerEgg(GoalNames.localEcon, {}, 2))

    return eggs
  },

  run,
}
