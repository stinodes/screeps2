import { nestFind, nestGoalData, nestMem, relativePosCurry } from 'nest/helpers'
import { GoalNames } from 'nest/types'
import { startUpGoal } from '.'

export type StartUpData = {
  initRoads?: boolean
  initExtensions?: boolean
}

export const hooks = (nest: string) => {
  const nestObj = nestGoalData(nest, GoalNames.startUp)
  buildRoads(nest)
}

const buildRoads = (nest: string) => {
  const maxRoadLength = 10
  const startUpHooks = nestGoalData(nest, GoalNames.startUp) as StartUpData
  if (!startUpHooks.initRoads) {
    const spawn = nestFind(nest, FIND_MY_SPAWNS)[0]

    /*
     * Add road around spawn
     */
    const rsPos = relativePosCurry(spawn.pos)
    const spawnRoadPositions = [
      rsPos(1, 0),
      rsPos(0, 1),
      rsPos(-1, 0),
      rsPos(0, -1),
    ]
    spawnRoadPositions.forEach(pos =>
      pos.createConstructionSite(STRUCTURE_ROAD),
    )

    /*
     * Create roads to sources
     */
    nestFind(nest, FIND_SOURCES).forEach(source => {
      const path = spawn.pos.findPathTo(source)
      path
        .slice(0, maxRoadLength)
        .forEach(pos =>
          new RoomPosition(pos.x, pos.y, nest).createConstructionSite(
            STRUCTURE_ROAD,
          ),
        )
    })

    startUpHooks.initRoads = true
  }
}
