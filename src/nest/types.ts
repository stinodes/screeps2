import {Egg} from 'creeps'
import {ColonyEconData} from './colonyEconGoal/hooks'
import {HuntingData} from './huntingGoal/hooks'
import {LocalEconData} from './localEconGoal/hooks'
import {SettleData} from './settleGoal/hooks'
import {StartUpData} from './startUpGoal/hooks'

export enum GoalNames {
  startUp = 'startUp',
  hunting = 'hunting',
  localEcon = 'localEcon',
  colonyEcon = 'colonyEcon',
  settle = 'settle',
}

export type Status = 'settling' | 'stable' | 'unhealthy' | 'unknown' | 'recovering'

export type Nest = {
  name: string

  status: Status

  markers: {
    [name: string]: string
  }

  [GoalNames.startUp]?: StartUpData
  [GoalNames.hunting]?: HuntingData
  [GoalNames.localEcon]?: LocalEconData
  [GoalNames.colonyEcon]?: ColonyEconData
  [GoalNames.settle]?: SettleData
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
