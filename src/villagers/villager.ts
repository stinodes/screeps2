import {
  currentQuestTask,
  getQuest,
  ObjectiveName,
  ObjectiveTarget,
} from 'quests'
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

const upgrade = (creep: Creep) => {
  const controller = creep.room.controller
  if (!controller) return
  creep.say('🔋')
  const result = creep.upgradeController(controller)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(controller)
  return result
}

export const villager = (villager: CreepMemory) => {
  console.log('Executing villager ' + villager.name)

  const creep = getVillagerCreep(villager.name)
  const quest = getQuest(villager.questId)
  const currentQuest = currentQuestTask(quest, creep)

  console.log('current quest: ', currentQuest?.name)

  if (!currentQuest) return

  const currentObjective = currentQuest.objective

  switch (currentObjective.name) {
    case ObjectiveName.harvest:
      harvest(creep, currentObjective.target)
      break
    case ObjectiveName.transfer:
      transfer(creep, currentObjective.target)
      break
    case ObjectiveName.upgrade:
      upgrade(creep)
      break
    default:
      creep.say('💤')
  }
}
