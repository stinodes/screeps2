import { QuestNames } from 'quests'
import { Requirement } from './requirements/requirementTypes'

export enum ObjectiveName {
  pickUp,
  harvest,
  transfer,
  upgrade,
  repair,
}
export enum ObjectiveTargetEnum {
  structure,
  tower,
  extension,
  spawn,
  storage,
  container,
  store,

  road,
  wall,

  constructionSite,
  source,
  resource,
}

export type Quest = {
  id: string
  name: QuestNames
  town: string
  objective: Objective
  requirements: Requirement[]
  priority?: number
  isComplete?: boolean
}

export type ObjectiveTarget<Type = any> = ObjectiveTargetEnum | Id<Type>
export type Objective<Type = any> = {
  name: ObjectiveName
  target: ObjectiveTarget<Type>
}

export type CreateQuest<Params extends {}> = (
  params: Params & { id?: string; town: string },
) => Quest
export type CanPickUpQuest = (
  quest: Quest,
  creep: Creep,
) => boolean | Requirement[]
export type CanCompleteQuest = (
  quest: Quest,
  creep: Creep,
) => boolean | Objective[]
