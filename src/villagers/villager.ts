import {ObjectiveTarget} from "quests"

const harvest = (creep: Creep, target: ObjectiveTarget<Source>) => {
  const source = typeof target === 'string' ? Game.getObjectById(target) : getTarget(creep, target)

  creep.say('⛏️')
  const result = creep.harvest(source)
  if (result === ERR_NOT_IN_RANGE)
    return creep.moveTo(source)
  return result
}

const transfer = (creep: Creep, target: ObjectiveTarget) => {
  creep.say('🚚')
  const
  const result = creep.transfer(source)
  if (result === ERR_NOT_IN_RANGE)
    return creep.moveTo(source)
  return result
}

const villager = (creep: Creep) => {
  const quest = Memory.quests[_.last(creep.memory.questDependencyQueue)]
  const currentObjective = quest.objective

}
