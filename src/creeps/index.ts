import {GoalNames} from 'nest/types'
import {Body} from './body'

export enum Spooders {
  spiderling = 'spiderling',
  coreWeaver = 'core-weaver',
  hunter = 'hunter',
  carrier = 'carrier',
  worker = 'worker',

  colonizer = 'colonizer',
  colonyWorker = 'colony-worker',
  colonyHunter = 'colony-hunter',
  colonyCarrier = 'colony-carrier',
}

export type Egg = {
  type: Spooders
  body: Body
  data: any
  goal: GoalNames

  index?: number
  priority: number
}

export type LayEgg<Data extends void | {}> = (
  goal: GoalNames,
  data: Data,
  priority?: number,
) => Egg
