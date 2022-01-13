import { QuestNames } from 'quests'
import { Requirement } from './requirements/requirementTypes'

export enum ObjectiveName {
  pickUp = 'pickUp',
  harvest = 'harvest',
  transfer = 'transfer',
  upgrade = 'upgrade',
  repair = 'repair',
}
export enum ObjectiveTargetEnum {
  structure = 'structure',
  tower = 'tower',
  extension = 'extension',
  spawn = 'spawn',
  storage = 'storage',
  container = 'container',
  store = 'store',
  controller = 'controller',

  road = 'road',
  wall = 'wall',

  constructionSite = 'constructionSite',
  source = 'source',
  resource = 'resource',
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

export type BaseQuestParams = { id?: string; town: string }
export type CreateQuest<Params extends {}> = (
  params: Params & BaseQuestParams,
) => Quest
export type CanPickUpQuest = (
  quest: Quest,
  creep: Creep,
) => boolean | Requirement[]
export type CanCompleteQuest = (
  quest: Quest,
  creep: Creep,
) => boolean | Objective[]
