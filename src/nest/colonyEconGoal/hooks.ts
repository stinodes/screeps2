import { Spooders } from 'creeps'
import { ColonyCarrier } from 'creeps/colonyCarrier'
import { ColonyHunter } from 'creeps/colonyHunter'
import { ColonyWorker } from 'creeps/colonyWorker'
import {
  nestGoalData,
  nestGoalSpoods,
  nestHuntingGrounds,
  nestMarker,
} from 'nest/helpers'
import { GoalNames } from 'nest/types'
import { deserializePos } from 'utils/helpers'

export type ColonyEconData = {
  colonyCandidates: string[]
  pendingColony: null | string
  activeColonies: string[]
  initColonyStructures: { [colony: string]: boolean }
}

global.addColonyCandidate = (nest: string, candidate: string) => {
  const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData
  const roomStatus = Game.map.getRoomStatus(candidate)
  if (
    roomStatus &&
    data.colonyCandidates &&
    !data.colonyCandidates.includes(candidate)
  ) {
    data.colonyCandidates.push(candidate)
  }
}

export const hooks = (nest: string) => {
  const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData

  const reevaluateTick = Game.time % 50 === 0

  if (
    reevaluateTick &&
    !data.pendingColony &&
    data.colonyCandidates.length &&
    data.colonyCandidates.length > data.activeColonies.length
  )
    kickOffColony(nest)
}

const kickOffColony = (nest: string) => {
  const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData

  const allSpiders = nestGoalSpoods<
    ColonyHunter | ColonyWorker | ColonyCarrier
  >(nest, GoalNames.colonyEcon)

  // Colonies with 1 worker and a miner/carrier per source
  const activeColoniesComplete = data.activeColonies.every(colony => {
    const spidersPerType = allSpiders
      .filter(s => s.data?.colony === colony)
      .reduce((prev, s) => {
        if (prev[s.type] === undefined) prev[s.type] = 1
        else prev[s.type]++

        return prev
      }, {} as { [key in Spooders]: number })

    return (
      spidersPerType[Spooders.colonyWorker] === 1 &&
      spidersPerType[Spooders.colonyHunter] ===
        nestHuntingGrounds(colony)?.length &&
      spidersPerType[Spooders.colonyCarrier] ===
        nestHuntingGrounds(colony)?.length
    )
  })

  if (!activeColoniesComplete) return

  const nextColonyCandidate = data.colonyCandidates.find(
    name => !data.activeColonies?.includes(name),
  )

  if (nextColonyCandidate) {
    data.pendingColony = nextColonyCandidate
  }
}
