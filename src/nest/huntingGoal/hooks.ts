import {
  getEmptyAdjecentSquares,
  nestFind,
  nestGoalData,
  nestLevel,
  nestMarker,
  nestRoom,
  sortByRange,
} from 'nest/helpers'
import { GoalNames } from 'nest/types'
import { deserializePos, serializePos } from 'utils/helpers'

export type HuntingData = {
  initContainers?: boolean
  initStorage?: boolean
}

export const hooks = (nest: string) => {
  createHuntingGrounds(nest)
  createContainerSites(nest)
  createStorage(nest)
}

const createHuntingGrounds = (nest: string) => {
  const roomMemory = nestRoom(nest).memory

  if (roomMemory.huntingGrounds) return

  const sources = nestFind(nest, FIND_SOURCES)
  const spawn = nestFind(nest, FIND_STRUCTURES, {
    filter: { structureType: STRUCTURE_SPAWN },
  })[0]

  const huntingGrounds = sources.map(source => {
    const sortedSpaces = sortByRange(
      getEmptyAdjecentSquares(source.pos).map(pos => ({ pos } as RoomObject)),
      spawn.pos,
    ).map(pObj => pObj.pos)

    return sortedSpaces[0]
  })

  roomMemory.huntingGrounds = huntingGrounds.map(serializePos)
}

const createContainerSites = (nest: string) => {
  const huntingData = nestGoalData(nest, GoalNames.hunting) as HuntingData
  const roomMemory = nestRoom(nest).memory

  if (!huntingData.initContainers && roomMemory.huntingGrounds) {
    const huntingGrounds = roomMemory.huntingGrounds.map(hg =>
      deserializePos(hg),
    )
    huntingGrounds.forEach(pos =>
      pos.createConstructionSite(STRUCTURE_CONTAINER),
    )

    huntingData.initContainers = true
  }
}

const createStorage = (nest: string) => {
  const huntingData = nestGoalData(nest, GoalNames.hunting) as HuntingData

  if (huntingData.initStorage || nestLevel(nest) < 4) return

  const storagePos = deserializePos(nestMarker(nest, 'storage'))
  storagePos.createConstructionSite(STRUCTURE_STORAGE)

  huntingData.initStorage = true
}
