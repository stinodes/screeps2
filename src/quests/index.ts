import { canCompleteFillQuest, createFillQuest } from './fill'
import { canCompleteHarvestQuest, createHarvestQuest } from './harvest'
import {
  BaseQuestParams,
  CanCompleteQuest,
  CanPickUpQuest,
  Quest,
} from './questTypes'
import { meetsRequirement } from './requirements'
import { canCompleteUpgradeQuest, createUpgradeQuest } from './upgrade'

export enum QuestNames {
  harvest = 'harvest',
  fill = 'fill',
  upgrade = 'upgrade',
}

export const createQuest = <Params extends BaseQuestParams>(
  name: QuestNames,
  params: Params,
) => {
  switch (name) {
    case QuestNames.fill:
      return createFillQuest(params)
    case QuestNames.harvest:
      return createHarvestQuest(params)
    case QuestNames.upgrade:
      return createUpgradeQuest(params)
    default:
      return null
  }
}

// Return:
//    * false if requirements cant be met
//    * true if requirements are met
//    * requirements if they have to be met
export const canPickUpQuest: CanPickUpQuest = (quest: Quest, creep: Creep) => {
  const unmetRequirements = quest.requirements.filter(
    req => !meetsRequirement(req, creep),
  )
  if (unmetRequirements.some(req => !req.fulfillableBy)) return false
  return !unmetRequirements.length || unmetRequirements
}

export const canCompleteQuest: CanCompleteQuest = (
  quest: Quest,
  creep: Creep,
) => {
  switch (quest.name) {
    case QuestNames.harvest:
      return canCompleteHarvestQuest(quest, creep)
    case QuestNames.fill:
      return canCompleteFillQuest(quest, creep)
    case QuestNames.upgrade:
      return canCompleteUpgradeQuest(quest, creep)
    default:
      return true
  }
}

export const currentQuestTask = (quest: Quest, creep: Creep) => {
  if (!quest) return null
  const canPickUp = canPickUpQuest(quest, creep)
  if (!canPickUp) return null
  if (canPickUp === true) return quest

  const requirement = canPickUp.find(req => req.fulfillableBy)
  if (!requirement) return null

  const nextTask = requirement.fulfillableBy && requirement.fulfillableBy[0]

  return nextTask ? createQuest(nextTask, { town: quest.town }) : null
}

export * from './selectors'
export * from './questTypes'
