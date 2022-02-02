import {LayEgg, Spooders} from 'creeps'
import {deserializePos, SerializedPosition} from 'utils/helpers'
import {ColonyHunter} from './colonyHunter'
import {creepForName} from './helpers'

export type Hunter = CreepMemory & {
  type: Spooders.hunter
  data: {
    huntingGround: SerializedPosition
    arrived?: boolean
    source?: null | Id<Source>
  }
}

export const layHunterEgg: LayEgg<Hunter['data']> = (
  goal,
  data,
  priority = 1,
) => ({
  type: Spooders.hunter,
  body: {
    parts: {
      [WORK]: 5,
      [MOVE]: 1,
    },
    grow: false,
  },
  goal,
  data: data,
  priority,
})

export const hunter = (hunter: ColonyHunter | Hunter) => {
  const creep = creepForName(hunter.name)
  const huntingGround = hunter.data?.huntingGround
  const pos = deserializePos(huntingGround)
  let arrived = hunter.data?.arrived
  let source = hunter.data?.source && Game.getObjectById(hunter.data.source)

  if (!huntingGround) return

  if (!arrived) {
    const range = creep.pos.getRangeTo(pos)
    if (range === 0) {
      hunter.data.arrived = arrived = true
    } else {
      creep.moveTo(pos)
    }
  }

  if (arrived && !source) {
    source = pos.findClosestByRange(FIND_SOURCES)
    if (source) hunter.data.source = source.id
  }

  if (arrived && source) {
    creep.harvest(source)
  }
}
