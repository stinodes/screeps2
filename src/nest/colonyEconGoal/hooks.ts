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
  colonyCandidates?: string[]
  activeColonies?: string[]
  initColonyStructures?: { [colony: string]: boolean }
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
  // findColonyCandidates(nest)
  if (!data.colonyCandidates) data.colonyCandidates = []
  if (!data.activeColonies) data.activeColonies = []

  // if (data.colonyCandidates && data.colonyCandidates.length)
  //   setActiveColonies(nest)
}

const findColonyCandidates = (nest: string) => {
  const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData

  if (data.colonyCandidates) return

  const adjecentRooms = Object.values(Game.map.describeExits(nest)).map(
    str => Game.rooms[str],
  )

  const possibleColonyNames = adjecentRooms
    .filter(
      room =>
        room.find(FIND_SOURCES).length &&
        (!room.controller || !room.controller.owner),
    )
    .sort(
      (roomA, roomB) =>
        roomA.find(FIND_SOURCES).length - roomB.find(FIND_SOURCES).length,
    )
    .map(room => room.name)

  data.colonyCandidates = possibleColonyNames
}

const setActiveColonies = (nest: string) => {
  const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData

  if (
    Game.time % 50 !== 0 ||
    !data.colonyCandidates ||
    !data.activeColonies ||
    data.colonyCandidates.length === data.activeColonies.length
  )
    return

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
    createColony(nest, nextColonyCandidate)
  }
}

const createColony = (nest: string, colony: string) => {
  console.log('ADDING COLONY: ', colony)
  const data = nestGoalData(nest, GoalNames.colonyEcon) as ColonyEconData
  const storagePos = deserializePos(nestMarker(nest, 'storage'))

  const hg = nestHuntingGrounds(colony) || []

  const hgPos = hg.map(deserializePos)
  const roads = hgPos
    .reduce((prev, hg) => {
      const { path } = PathFinder.search(storagePos, hg)
      return prev.concat(path)
    }, [] as RoomPosition[])
    .filter(pos => pos.roomName !== nest)

  data.activeColonies?.push(colony)

  hgPos.map(pos => pos.createConstructionSite(STRUCTURE_CONTAINER))
  roads.map(pos => pos.createConstructionSite(STRUCTURE_ROAD))
}
