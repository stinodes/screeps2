import {Egg, Spooders} from 'creeps'
import {Colonizer, layColonizerEgg} from 'creeps/colonizer'
import {ColonyCarrier, layColonyCarrierEgg} from 'creeps/colonyCarrier'
import {ColonyHunter, layColonyHunterEgg} from 'creeps/colonyHunter'
import {ColonyWorker, layColonyWorkerEgg} from 'creeps/colonyWorker'
import {
  nestGoalData,
  nestGoalSpoods,
  nestHuntingGrounds,
  nestLevel,
} from 'nest/helpers'
import {Goal, GoalNames} from 'nest/types'
import {ColonyEconData} from './hooks'
import {run} from './run'

export const colonyEconGoal: Goal = {
  name: GoalNames.colonyEcon,
  canCreate: (nest: string) => {
    const level = nestLevel(nest)
    return level >= 4
  },
  isComplete: () => false,
  eggs: (nest: string) => {
    const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData
    const pendingColony = data.pendingColony
    const colonies = data.activeColonies
    const eggs: Egg[] = []

    const allSpiders = nestGoalSpoods<
      Colonizer | ColonyHunter | ColonyWorker | ColonyCarrier
    >(nest, GoalNames.colonyEcon)

    if (pendingColony) {
      const hasColonizer = allSpiders.some(s => s.type === Spooders.colonizer && s.data?.colony === pendingColony)
      if (!hasColonizer)
        eggs.push(layColonizerEgg(GoalNames.colonyEcon, {colony: pendingColony}))
    }

    colonies?.forEach(colony => {
      const colonySpiders = allSpiders.filter(s => s.data?.colony === colony)

      const huntingGrounds = nestHuntingGrounds(colony) || []

      if (!colonySpiders.some(s => s.type === Spooders.colonizer))
        eggs.push(layColonizerEgg(GoalNames.colonyEcon, {colony}))
      if (!colonySpiders.some(s => s.type === Spooders.colonyWorker))
        eggs.push(layColonyWorkerEgg(GoalNames.colonyEcon, {colony}))

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
