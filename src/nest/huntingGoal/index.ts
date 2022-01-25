import { Egg, Spooders } from 'creeps'
import { Carrier, layCarrierEgg } from 'creeps/carrier'
import { Hunter, layHunterEgg } from 'creeps/hunter'
import { nestFind, nestGoalData, nestLevel, nestSpoods } from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { HuntingData } from './hooks'
import { run } from './run'

export const huntingGoal: Goal = {
  name: GoalNames.hunting,
  canCreate: (nest: string) => {
    const level = nestLevel(nest)
    const exts = nestFind(nest, FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION },
    })
    return level > 2 && exts.length > 5
  },
  isComplete: (nest: string) => false,

  eggs: (nest: string) => {
    const eggs: Egg[] = []
    const { huntingGrounds } =
      (nestGoalData(nest, GoalNames.hunting) as HuntingData) || {}
    const spoods = nestSpoods(nest)
    const hunters = spoods.filter(
      spood => spood.type === Spooders.hunter,
    ) as Hunter[]
    const carriers = spoods.filter(
      spood => spood.type === Spooders.carrier,
    ) as Carrier[]

    if (!huntingGrounds || !huntingGrounds.length) return eggs

    if (hunters.length !== huntingGrounds.length)
      huntingGrounds.forEach(pos => {
        if (!hunters.some(h => h.data?.huntingGround === pos))
          eggs.push(layHunterEgg({ huntingGround: pos }))
      })

    if (carriers.length !== huntingGrounds.length)
      huntingGrounds.forEach(pos => {
        if (!carriers.some(h => h.data?.huntingGround === pos))
          eggs.push(layCarrierEgg({ huntingGround: pos }))
      })

    return eggs
  },

  run,
}
