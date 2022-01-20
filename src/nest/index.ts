import { Egg, Spooders } from 'creeps'
import { v4 } from 'uuid'
import { nestRoom } from './helpers'
import { startUpGoal } from './startUpGoal'
import { Goal, GoalNames, Nest } from './types'

export const createNest = (room: string): Nest => ({
  name: room,
  hooks: {},
})

const goals: { [nest: string]: Goal[] } = {}
const getGoals = (nestName: string) => {
  if (!goals[nestName]) {
    goals[nestName] = [startUpGoal]
  }
  return goals[nestName]
}

const hatchEggs = (nest: Nest) => {
  const goals = getGoals(nest.name)
  const spawns = nestRoom(nest.name).find(FIND_MY_SPAWNS)

  const eggQueue = goals.reduce((prev, goal) => {
    const eggs = goal.eggs(nest.name)
    return prev.concat(eggs.map(egg => ({ goal: goal.name, egg: egg })))
  }, [] as { goal: GoalNames; egg: Egg }[])

  eggQueue.some(({ egg, goal }) => {
    const name = `${egg.type}-${v4()}`

    return (
      spawns
        .find(spawn => !spawn.spawning)
        ?.spawnCreep([WORK, WORK, CARRY, MOVE], name, {
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
