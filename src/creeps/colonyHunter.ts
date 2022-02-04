import { LayEgg, Spooders } from 'creeps'
import { SerializedPosition } from 'utils/helpers'

export type ColonyHunter = CreepMemory & {
  type: Spooders.colonyHunter
  data: {
    huntingGround: SerializedPosition
    arrived?: boolean
    source?: null | Id<Source>
    colony: string
  }
}

export const layColonyHunterEgg: LayEgg<ColonyHunter['data']> = (
  goal,
  data,
  priority = 3,
) => ({
  type: Spooders.colonyHunter,
  body: {
    parts: {
      [WORK]: 5,
      [MOVE]: 5,
    },
    grow: false,
  },
  goal,
  data: data,
  priority,
})
