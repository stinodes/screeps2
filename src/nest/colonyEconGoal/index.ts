import { Egg, Spooders } from 'creeps'
import { ColonyCarrier, layColonyCarrierEgg } from 'creeps/colonyCarrier'
import { ColonyHunter, layColonyHunterEgg } from 'creeps/colonyHunter'
import { ColonyWorker, layColonyWorkerEgg } from 'creeps/colonyWorker'
import {
  nestGoalData,
  nestGoalSpoods,
  nestHuntingGrounds,
  nestLevel,
} from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { ColonyEconData } from './hooks'
import { run } from './run'

export const colonyEconGoal: Goal = {
  name: GoalNames.colonyEcon,
  canCreate: (nest: string) => {
    const level = nestLevel(nest)
    return level >= 4
  },
  isComplete: () => false,
  eggs: (nest: string) => {
    const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData
    const colonies = data.activeColonies
    const eggs: Egg[] = []

    const allSpiders = nestGoalSpoods<
      ColonyHunter | ColonyWorker | ColonyCarrier
    >(nest, GoalNames.colonyEcon)

    colonies?.forEach(colony => {
      const colonySpiders = allSpiders.filter(s => s.data?.colony === colony)

      const huntingGrounds = nestHuntingGrounds(colony) || []

      if (!colonySpiders.some(s => s.type === Spooders.colonyWorker))
        eggs.push(layColonyWorkerEgg(GoalNames.colonyEcon, { colony }))

      huntingGrounds.forEach(g => {
        if (
          !colonySpiders.some(
            s =>
              s.type === Spooders.colonyHunter && s.data?.huntingGround === g,
          )
        )
          eggs.push(
            layColonyHunterEgg(GoalNames.colonyEcon, {
              huntingGround: g,
              colony,
            }),
          )

        if (
          !colonySpiders.some(
            s =>
              s.type === Spooders.colonyCarrier && s.data?.huntingGround === g,
          )
        )
          eggs.push(
            layColonyCarrierEgg(GoalNames.colonyEcon, {
              huntingGround: g,
              colony,
            }),
          )
      })
    })

    return eggs
  },
  run,
}
