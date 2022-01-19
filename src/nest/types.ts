import {Spooders} from 'creeps'

export enum GoalNames {
  startUp = 'startUp',
}

export type Nest = {
  name: string
}

export type GoalState = {
  name: string
  creeps: string[]
}

type CanCreate = (nest: string) => boolean
type IsComplete = (nest: string) => boolean
type RequestJobs = (nest: string) => Spooders[]
type Run = (nest: string) => any
export type Goal = {
  name: GoalNames
  canCreate: CanCreate
  isComplete: IsComplete
  eggs: RequestJobs

  run: Run
}
