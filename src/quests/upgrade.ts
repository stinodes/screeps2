import { QuestNames } from 'quests'
import { v4 } from 'uuid'
import {
  CanCompleteQuest,
  CreateQuest,
  Objective,
  ObjectiveName,
  ObjectiveTargetEnum,
  Quest,
} from './questTypes'
import { Requirement } from './requirements'
import { createHasBodyPartRequirement } from './requirements/hasBodyPartRequirement'
import { createIsFullRequirement } from './requirements/isFullRequirement'

export type UpgradeQuestParams = {}
export const createUpgradeQuest: CreateQuest<UpgradeQuestParams> = ({
  town,
  id,
}) => {
  const objective: Objective = {
    name: ObjectiveName.upgrade,
    target: ObjectiveTargetEnum.controller,
  }

  const requirements: Requirement[] = [
    createHasBodyPartRequirement({ n: 1, type: WORK }),
    createHasBodyPartRequirement({ n: 1, type: CARRY }),
    createIsFullRequirement({}),
  ]

  return {
    id: id || v4(),
    town,
    name: QuestNames.upgrade,
    objective,
    requirements,
  }
}

export const canCompleteUpgradeQuest: CanCompleteQuest = (
  quest: Quest,
  creep: Creep,
) => {
  return creep.store.getUsedCapacity() === 0
}
