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
    return level >= 2 && exts.length >= 5
  },
  isComplete: () => false,

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

    huntingGrounds.forEach(hg => {
      if (!hunters.some(h => h.data.huntingGround === hg))
        eggs.push(layHunterEgg(GoalNames.hunting, { huntingGround: hg }))

      if (!carriers.some(c => c.data?.huntingGround === hg))
        eggs.push(layCarrierEgg(GoalNames.hunting, { huntingGround: hg }))
    })

    return eggs
  },

  run,
}
