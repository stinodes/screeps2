import { v4 } from 'uuid'
import { QuestNames } from 'quests'
import {
  CanCompleteQuest,
  CreateQuest,
  Objective,
  ObjectiveName,
  ObjectiveTarget,
  ObjectiveTargetEnum,
  Quest,
} from './questTypes'
import { Requirement } from './requirements'
import { createHasBodyPartRequirement } from './requirements/hasBodyPartRequirement'
import { createHasCapacityRequirement } from './requirements/hasCapacityRequirement'

export const createHarvestQuest: CreateQuest<{ sourceId?: Id<Source> }> = ({
  id,
  town,
  sourceId,
}) => {
  const objective: Objective = {
    name: ObjectiveName.harvest,
    target: sourceId || ObjectiveTargetEnum.source,
  }

  const requirements: Requirement[] = [
    createHasBodyPartRequirement({ n: 1, type: WORK }),
    createHasBodyPartRequirement({ n: 1, type: CARRY }),
    createHasCapacityRequirement({}),
  ]

  return {
    id: id || v4(),
    town,
    name: QuestNames.harvest,
    objective,
    requirements,
  }
}

export const canCompleteHarvestQuest: CanCompleteQuest = (
  quest: Quest,
  creep: Creep,
) => {
  return creep.store.getFreeCapacity() === 0
}
