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

export type FillQuestParams = {
  structureId?: Id<AnyStoreStructure>
}
export const createFillQuest: CreateQuest<FillQuestParams> = ({
  structureId,
  town,
  id,
}) => {
  const objective: Objective = {
    name: ObjectiveName.transfer,
    target: structureId || ObjectiveTargetEnum.store,
  }

  const requirements: Requirement[] = [
    createHasBodyPartRequirement({ n: 1, type: WORK }),
    createHasBodyPartRequirement({ n: 1, type: CARRY }),
    createIsFullRequirement({}),
  ]

  return {
    id: id || v4(),
    town,
    name: QuestNames.fill,
    objective,
    requirements,
  }
}

export const canCompleteFillQuest: CanCompleteQuest = (
  quest: Quest,
  creep: Creep,
) => {
  const fillTarget = Game.getObjectById(
    quest.objective.target as Id<Structure>,
  ) as null | AnyStoreStructure
  return (
    creep.store.getUsedCapacity() === 0 ||
    fillTarget?.store.getFreeCapacity() === 0
  )
}
