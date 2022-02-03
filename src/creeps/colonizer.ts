import { LayEgg, Spooders } from 'creeps'
import { ColonyEconData } from 'nest/colonyEconGoal/hooks'
import { nestGoalData, nestHuntingGrounds, nestMarker } from 'nest/helpers'
import { GoalNames } from 'nest/types'
import { deserializePos } from 'utils/helpers'
import { creepForName } from './helpers'

export type Colonizer = CreepMemory & {
  type: Spooders.colonizer
  data: {
    colony: string
    route?: string
  }
}

const serializeRoute = (route: { exit: ExitConstant; room: string }[]) =>
  route.map(r => `${r.exit},${r.room}`).join(';')
const deserializeRoute = (route: string) =>
  route.split(';').map(r => {
    const [exit, room] = r.split(',')
    return { exit: parseInt(exit) as ExitConstant, room }
  })
const getRoute = (colonizer: Colonizer) => {
  if (colonizer.data.route) return deserializeRoute(colonizer.data.route)

  const route = Game.map.findRoute(colonizer.nest, colonizer.data.colony)
  if (route === ERR_NO_PATH) return null
  colonizer.data.route = serializeRoute(route)
  return route
}

export const layColonizerEgg: LayEgg<Colonizer['data']> = (
  goal,
  data,
  priority = 3,
) => ({
  type: Spooders.colonizer,
  body: {
    parts: {
      [MOVE]: 10,
      [CLAIM]: 5,
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
    const route = getRoute(colonizer) || []
    const currentStep = route.find(r => r.room === creep.room.name)
    if (!currentStep) return
    const exit = creep.room.find(currentStep.exit)
    creep.moveTo(exit[0])
  }
}

const buildColonyInfra = (nest: string, colony: string) => {
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

  hgPos.map(pos => pos.createConstructionSite(STRUCTURE_CONTAINER))
  roads.map(pos => pos.createConstructionSite(STRUCTURE_ROAD))

  data.initColonyStructures[colony] = true
  data.pendingColony = null
  data.activeColonies.push(colony)
}
