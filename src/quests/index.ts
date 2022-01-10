import {canCompleteFillQuest} from './fill'
import {canCompleteHarvestQuest} from './harvest'
import {CanCompleteQuest, CanPickUpQuest, Quest} from './questTypes'
import {meetsRequirement} from './requirements'

export enum QuestNames {
  harvest,
  fill,
}

// Return:
//    * false if requirements cant be met
//    * true if requirements are met
//    * requirements if they have to be met
export const canPickUpQuest: CanPickUpQuest = (quest: Quest, creep: Creep) => {
  const unmetRequirements = quest.requirements.filter(req => !meetsRequirement(req, creep))
  if (unmetRequirements.some(req => !req.fulfillableBy))
    return false
  return !unmetRequirements.length || unmetRequirements
}

export const canCompleteQuest: CanCompleteQuest = (quest: Quest, creep: Creep) => {
  switch (quest.name) {
    case QuestNames.harvest:
      return canCompleteHarvestQuest(quest, creep)
    case QuestNames.fill:
      return canCompleteFillQuest(quest, creep)
    default:
      return true
  }
}

export * from './questTypes'
