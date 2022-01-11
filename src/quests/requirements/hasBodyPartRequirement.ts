import {
  CreateRequirement,
  MeetsRequirement,
  Requirement,
  RequirementNames,
} from './'

export type HasBodyPartRequirement = Requirement & {
  name: RequirementNames.hasBodyPart
  data: { n: number; type: BodyPartConstant }
}
export const createHasBodyPartRequirement: CreateRequirement<
  { n: number; type: BodyPartConstant },
  HasBodyPartRequirement
> = ({ n, type }) => {
  return {
    name: RequirementNames.hasBodyPart,
    fulfillableBy: false,
    data: { n, type },
  }
}

export const meetsBodyRequirement: MeetsRequirement<HasBodyPartRequirement> = (
  requirement,
  creep,
) => {
  return (
    creep.body.filter(b => b.type === requirement.data.type).length >=
    requirement.data.n
  )
}
