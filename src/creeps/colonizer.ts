import { LayEgg, Spooders } from 'creeps'
import { ColonyEconData } from 'nest/colonyEconGoal/hooks'
import {
  getEmptyAdjecentSquares,
  nestFind,
  nestGoalData,
  nestHuntingGrounds,
  nestMarker,
  nestRoom,
} from 'nest/helpers'
import { GoalNames } from 'nest/types'
import { deserializePos, serializePos } from 'utils/helpers'
import { creepForName } from './helpers'

export type Colonizer = CreepMemory & {
  type: Spooders.colonizer
  data: {
    colony: string
    route?: string
  }
}

export const layColonizerEgg: LayEgg<Colonizer['data']> = (
  goal,
  data,
  priority = 3,
) => ({
  type: Spooders.colonizer,
  body: {
    parts: {
      [MOVE]: 2,
      [CLAIM]: 2,
    },
    grow: false,
  },
  goal,
  data: data,
  priority,
})

export const colonizer = (colonizer: Colonizer) => {
  const creep = creepForName(colonizer.name)
  const colony = colonizer.data?.colony

  if (!colony) return

  if (creep.room.name === colony) {
    if (!creep.room.controller || creep.room.controller.owner) return

    const data = nestGoalData(
      colonizer.nest,
      GoalNames.colonyEcon,
    ) as ColonyEconData
    if (!data.initColonyStructures[colony])
      buildColonyInfra(colonizer.nest, colony)

    if (creep.reserveController(creep.room.controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller)
    }
  } else {
    const position = new RoomPosition(20, 20, colony)
    creep.moveTo(position)
  }
}

const buildColonyInfra = (nest: string, colony: string) => {
  const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData

  const storagePos = deserializePos(nestMarker(nest, 'storage'))

  const hg = nestHuntingGrounds(colony) || createHuntingGrounds(colony)

  if (!hg) return

  const hgPos = hg.map(deserializePos)
  const roads = hgPos
    .reduce((prev, hg) => {
      const { path } = PathFinder.search(storagePos, hg)
      return prev.concat(path)
    }, [] as RoomPosition[])
    .filter(pos => pos.roomName !== nest)

  hgPos.map(pos => pos.createConstructionSite(STRUCTURE_CONTAINER))
  roads.map(pos => pos.createConstructionSite(STRUCTURE_ROAD))

  console.log(hgPos.map(serializePos))
  console.log(roads.map(serializePos))

  data.initColonyStructures[colony] = true
  data.pendingColony = null
  data.activeColonies.push(colony)
}

const createHuntingGrounds = (room: string) => {
  const roomMemory = nestRoom(room).memory

  if (roomMemory.huntingGrounds) return

  const sources = nestFind(room, FIND_SOURCES)

  const huntingGrounds = sources.map(source => {
    const sortedSpaces = getEmptyAdjecentSquares(source.pos)
      .map(pos => ({ pos } as RoomObject))
      .map(pObj => pObj.pos)

    return sortedSpaces[0]
  })

  roomMemory.huntingGrounds = huntingGrounds.map(serializePos)
  return roomMemory.huntingGrounds
}
