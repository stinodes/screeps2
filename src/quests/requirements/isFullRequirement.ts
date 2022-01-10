import {QuestNames} from "quests";
import {RequirementNames} from "./";
import {CreateRequirement, MeetsRequirement, Requirement} from "./requirementTypes";

export type IsFullRequirement = Requirement & {
  name: RequirementNames.isFull,
  data: {}
}
export const createIsFullRequirement: CreateRequirement<{}, IsFullRequirement> = ({}) => {
  return {
    name: RequirementNames.isFull,
    fulfillableBy: [QuestNames.harvest],
    data: {}
  }
}

export const meetsIsFullRequirement: MeetsRequirement<IsFullRequirement> = (requirement, creep) => {
  return creep.store.getFreeCapacity() === 0
}
