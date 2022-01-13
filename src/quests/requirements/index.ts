import {
  HasBodyPartRequirement,
  meetsBodyRequirement,
} from './hasBodyPartRequirement'
import {
  HasCapacityRequirement,
  meetsCapacityRequirement,
} from './hasCapacityRequirement'
import { IsFullRequirement, meetsIsFullRequirement } from './isFullRequirement'
import { Requirement } from './requirementTypes'

export enum RequirementNames {
  hasBodyPart = 'hasBodyPart',
  hasCapacity = 'hasCapacity',
  isFull = 'isFull',
}

export const meetsRequirement = (requirement: Requirement, creep: Creep) => {
  switch (requirement.name) {
    case RequirementNames.hasBodyPart:
      return meetsBodyRequirement(requirement as HasBodyPartRequirement, creep)
    case RequirementNames.hasCapacity:
      return meetsCapacityRequirement(
        requirement as HasCapacityRequirement,
        creep,
      )
    case RequirementNames.isFull:
      return meetsIsFullRequirement(requirement as IsFullRequirement, creep)
    default:
      return true
  }
}

export * from './requirementTypes'
