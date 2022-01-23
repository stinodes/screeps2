import { Egg, Spooders } from 'creeps'
import { carrier, Carrier } from 'creeps/carrier'
import { hunter, Hunter } from 'creeps/hunter'
import { nestGoalData, nestSpoods } from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { serializePos } from 'utils/helpers'
import { HuntingData } from './hooks'

export const huntingGoal: Goal = {
  name: GoalNames.hunting,
  canCreate: (nest: string) => false,
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

    if (hunters.length !== huntingGrounds.length)
      huntingGrounds.forEach(pos => {
        if (!hunters.some(h => h.data?.huntingGround === pos))
          eggs.push({ type: Spooders.hunter, data: { huntingGround: pos } })
      })

    if (carriers.length !== huntingGrounds.length)
      huntingGrounds.forEach(pos => {
        if (!carriers.some(h => h.data?.huntingGround === pos))
          eggs.push({ type: Spooders.carrier, data: { huntingGround: pos } })
      })

    return eggs
  },

  run: nest => {
    const spoods = nestSpoods(nest)

    spoods.forEach(s => {
      switch (s.type) {
        case Spooders.hunter:
          hunter(s as Hunter)
          break
        case Spooders.carrier:
          carrier(s as Carrier)
          break
      }
    })
  },
}
