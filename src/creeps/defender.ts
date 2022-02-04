import { LayEgg, Spooders } from 'creeps'
import { creepForName } from './helpers'

export type Defender = CreepMemory & {
  type: Spooders.defender
  data: {
    room: string
    colony?: string
  }
}

export const layDefenderEgg: LayEgg<Defender['data']> = (
  goal,
  data,
  priority = 3,
) => ({
  type: Spooders.defender,
  body: {
    parts: {
      [MOVE]: 2,
      [ATTACK]: 1,
      [TOUGH]: 1,
    },
    max:
      BODYPART_COST[MOVE] * 8 +
      BODYPART_COST[ATTACK] * 4 +
      BODYPART_COST[TOUGH] * 4,
    grow: true,
  },
  goal,
  data: data,
  priority,
})

export const defender = (defender: Defender) => {
  const creep = creepForName(defender.name)
  const room = defender.data?.room || defender.nest

  if (creep.room.name === room) {
    const closestCreep = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
    if (!closestCreep) return

    if (creep.attack(closestCreep) === ERR_NOT_IN_RANGE)
      creep.moveTo(closestCreep)
  } else {
    const position = new RoomPosition(20, 20, room)
    creep.moveTo(position)
  }
}
