import {QuestNames} from "quests"
import {v4} from "uuid"
import {CanCompleteQuest, CreateQuest, Objective, ObjectiveName, ObjectiveTarget, Quest} from "./questTypes"
import {Requirement} from "./requirements"
import {createHasBodyPartRequirement} from "./requirements/hasBodyPartRequirement"
import {createIsFullRequirement} from "./requirements/isFullRequirement"

export const createFillQuest: CreateQuest<{structureId?: string}> = ({structureId, id}) => {
  const objective: Objective = {
    name: ObjectiveName.transfer,
    target: structureId || ObjectiveTarget.store
  }

  const requirements: Requirement[] = [
    createHasBodyPartRequirement({n: 1, type: WORK}),
    createHasBodyPartRequirement({n: 1, type: CARRY}),
    createIsFullRequirement({}),
  ]

  return {
    id: id || v4,
    name: QuestNames.fill,
    objective,
    requirements,
  }
}

export const canCompleteFillQuest: CanCompleteQuest = (quest: Quest, creep: Creep) => {
  const fillTarget = Game.getObjectById(quest.objective.target as Id<Structure>) as null | AnyStoreStructure
  return creep.store.getUsedCapacity() === 0 || fillTarget?.store.getFreeCapacity() === 0
}
