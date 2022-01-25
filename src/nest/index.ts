import { Egg } from 'creeps'
import { createBody } from 'creeps/body'
import { serializePos } from 'utils/helpers'
import { v4 } from 'uuid'
import { nestRoom, relativePos } from './helpers'
import { huntingGoal } from './huntingGoal'
import { startUpGoal } from './startUpGoal'
import { Goal, GoalNames, Nest } from './types'

export const createNest = (roomName: string): Nest => {
  const room = Game.rooms[roomName]
  const spawn = room.find(FIND_STRUCTURES, {
    filter: { structureType: STRUCTURE_SPAWN },
  })[0]
  const markers: Nest['markers'] = {}

  if (spawn) markers.hatchery = serializePos(spawn.pos)
  if (spawn) markers.storage = serializePos(relativePos(spawn.pos, 0, -2))

  return {
    name: roomName,
    [GoalNames.startUp]: {},
    [GoalNames.hunting]: {},

    markers,
  }
}

const goals: { [nest: string]: Goal[] } = {}
const getGoals = (nestName: string) => {
  if (!goals[nestName]) {
    goals[nestName] = [startUpGoal, huntingGoal]
  }
  // DONT RETURN IRRELEVANT GOALS
  return goals[nestName].filter(g => g.canCreate(nestName))
}

const hatchEggs = (nest: Nest) => {
  const goals = getGoals(nest.name)
  const spawns = nestRoom(nest.name).find(FIND_MY_SPAWNS)
  const spawnEnergy = nestRoom(nest.name).energyCapacityAvailable

  const eggQueue = goals
    // DONT SPAWN FOR COMPLETED GOALS
    .filter(g => g.isComplete(nest.name))
    .reduce((prev, goal) => {
      const eggs = goal.eggs(nest.name)
      return prev.concat(eggs.map(egg => ({ goal: goal.name, egg: egg })))
    }, [] as { goal: GoalNames; egg: Egg }[])

  eggQueue.some(({ egg, goal }) => {
    const name = `${egg.type}-${v4()}`

    return (
      spawns
        .find(spawn => !spawn.spawning)
        ?.spawnCreep(createBody(egg.body, spawnEnergy), name, {
          memory: {
            name,
            goal,
            type: egg.type,
            nest: nest.name,
            data: egg.data,
          },
        }) !== OK
    )
  })
}

export const nest = (nest: Nest) => {
  const goals = getGoals(nest.name)
  hatchEggs(nest)
  goals.forEach(goal => goal.run(nest.name))
}
