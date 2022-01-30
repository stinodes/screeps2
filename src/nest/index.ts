import { Egg } from 'creeps'
import uuid from 'uuid-js'
import { createBody } from 'creeps/body'
import { serializePos } from 'utils/helpers'
import { nestRoom, relativePos } from './helpers'
import { huntingGoal } from './huntingGoal'
import { localEconGoal } from './localEconGoal'
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
    goals[nestName] = [startUpGoal, localEconGoal, huntingGoal]
  }
  // DONT RETURN IRRELEVANT GOALS
  return goals[nestName].filter(g => g.canCreate(nestName))
}

const hatchEggs = (nest: Nest) => {
  const goals = getGoals(nest.name)
  const spawns = nestRoom(nest.name).find(FIND_MY_SPAWNS)
  const spawnEnergy = nestRoom(nest.name).energyCapacityAvailable

  console.log(goals.map(g => g.name).join(' - '))

  const eggQueue = goals
    // DONT SPAWN FOR COMPLETED GOALS
    .filter(g => !g.isComplete(nest.name))
    .reduce((prev, goal) => {
      const eggs = goal.eggs(nest.name)
      return prev.concat(eggs)
    }, [] as Egg[])
    .map((egg, index) => {
      egg.index = index
      return egg
    })
    .sort((a, b) => {
      const comp = a.priority - b.priority
      if (
        comp === 0 &&
        typeof a.index === 'number' &&
        typeof b.index === 'number'
      )
        return a.index - b.index
      return comp
    })

  console.log('eggs: ', eggQueue.map(egg => egg.type).join(' - '))

  eggQueue.some(egg => {
    const name = `${egg.type}-${uuid.create().toString()}`

    return (
      spawns
        .find(spawn => !spawn.spawning)
        ?.spawnCreep(createBody(egg.body, spawnEnergy), name, {
          memory: {
            name,
            goal: egg.goal,
            type: egg.type,
            nest: nest.name,
            data: egg.data,
          },
        }) === OK
    )
  })
}

export const nest = (nest: Nest) => {
  const goals = getGoals(nest.name)
  hatchEggs(nest)
  goals.forEach(goal => goal.run(nest.name))
}
