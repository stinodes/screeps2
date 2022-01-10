import {CreateRequirement, MeetsRequirement, Requirement, RequirementNames} from "./";

export type HasCapacityRequirement = Requirement & {
  name: RequirementNames.hasCapacity,
  data: {}
}
export const createHasCapacityRequirement: CreateRequirement<{}, HasCapacityRequirement> = ({}) => {
  return {
    name: RequirementNames.hasCapacity,
    fulfillableBy: false,
    data: {}
  }
}

export const meetsCapacityRequirement: MeetsRequirement<HasCapacityRequirement> = (requirement, creep) => {
  return creep.store.getFreeCapacity() > 0
}
