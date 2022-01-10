import {ObjectiveTargetEnum} from "quests"

export const getTarget = (creep: Creep, target: ObjectiveTargetEnum) => {
  switch (target) {
    case ObjectiveTargetEnum.source:
      return creep.pos.findClosestByPath(FIND_SOURCES)
    case ObjectiveTargetEnum.store:
      return creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (struct) => true
      })
    default:
      return null
  }
}
