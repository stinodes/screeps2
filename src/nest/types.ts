import { Spooders } from 'creeps'
import { GoalNames } from 'nest'

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
  requestJobs: RequestJobs
  run: Run
}
