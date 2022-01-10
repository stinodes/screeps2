import {Quest} from "../questTypes";
import {HasBodyPartRequirement, meetsBodyRequirement} from "./hasBodyPartRequirement";
import {HasCapacityRequirement, meetsCapacityRequirement} from "./hasCapacityRequirement";
import {Requirement} from "./requirementTypes";

export enum RequirementNames {
  hasBodyPart,
  hasCapacity,
  isFull,
}

export const meetsRequirement = (requirement: Requirement, creep: Creep) => {
  switch (requirement.name) {
    case RequirementNames.hasBodyPart:
      return meetsBodyRequirement(requirement as HasBodyPartRequirement, creep)
    case RequirementNames.hasCapacity:
      return meetsCapacityRequirement(requirement as HasCapacityRequirement, creep)
    default:
      return true
  }
}

export * from './requirementTypes'
