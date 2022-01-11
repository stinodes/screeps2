import { ObjectiveName, ObjectiveTarget } from 'quests'
import { getVillagerCreep } from './selectors'
import { getTarget } from './target'

const harvest = (creep: Creep, target: ObjectiveTarget<Source>) => {
  const source = getTarget(creep, target)
  if (!source) return
  creep.say('⛏️')
  const result = creep.harvest(source)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(source)
  return result
}

const transfer = (creep: Creep, target: ObjectiveTarget<AnyStoreStructure>) => {
  const store = getTarget(creep, target)
  if (!store) return
  creep.say('🚚')
  const result = creep.transfer(store, RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(store)
  return result
}

export const villager = (villager: CreepMemory) => {
  const creep = getVillagerCreep(villager.name)
  const quest = Memory.quests[_.last(creep.memory.questDependencyQueue)]
  const currentObjective = quest.objective

  switch (currentObjective.name) {
    case ObjectiveName.harvest:
      harvest(creep, currentObjective.target)
    case ObjectiveName.transfer:
      transfer(creep, currentObjective.target)
    default:
      creep.say('💤')
  }
}
