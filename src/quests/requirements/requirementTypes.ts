import {QuestNames} from "quests"
import {Quest} from "quests/questTypes"
import {RequirementNames} from "."

type RequirementData = {[key: string]: string | number}
export type Requirement = {
  name: RequirementNames
  fulfillableBy: false | QuestNames[]
  data: RequirementData
}

export type CreateRequirement<Params extends {}, R extends Requirement = Requirement> = (params: Params) => R
export type MeetsRequirement<R extends Requirement> = (requirement: R, creep: Creep) => boolean

