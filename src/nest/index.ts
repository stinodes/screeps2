import { Goal, Nest } from './types'

export enum GoalNames {
  startUp = 'startUp',
}

export const createNest = (room: string): Nest => ({
  name: room,
})

const goals: { [nest: string]: Goal[] } = {}
const getGoals = (nestName: string) => goals[nestName]

export const nest = (nest: Nest) => {
  const goals = getGoals(nest.name)
}
