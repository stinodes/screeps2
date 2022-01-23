import { Egg, Spooders } from 'creeps'
import { HuntingData } from './huntingGoal/hooks'
import { StartUpData } from './startUpGoal/hooks'

export enum GoalNames {
  startUp = 'startUp',
  hunting = 'hunting',
}

export type Nest = {
  name: string

  data: {
    [GoalNames.startUp]?: StartUpData
    [GoalNames.hunting]?: HuntingData
  }
}

export type GoalState = {
  name: string
  creeps: string[]
}

type CanCreate = (nest: string) => boolean
type IsComplete = (nest: string) => boolean
type RequestJobs = (nest: string) => Egg[]
type Run = (nest: string) => any
export type Goal = {
  name: GoalNames
  canCreate: CanCreate
  isComplete: IsComplete
  eggs: RequestJobs

  run: Run
}
