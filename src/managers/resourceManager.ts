import { ObjectiveName } from 'quests'
import { createFillQuest } from 'quests/fill'
import { Manager } from './managerTypes'

export const resourceManager = (manager: Manager) => {
  const room = Game.rooms[manager.town]

  const storesWithoutQuest = room.find(FIND_MY_STRUCTURES, {
    filter: struct =>
      (struct.structureType === STRUCTURE_SPAWN ||
        struct.structureType === STRUCTURE_EXTENSION ||
        struct.structureType === STRUCTURE_STORAGE) &&
      struct.store.getFreeCapacity() !== 0 &&
      !Object.values(Memory.quests).some(
        quest =>
          quest.objective.name === ObjectiveName.transfer &&
          quest.objective.target === struct.id,
      ),
  }) as AnyStoreStructure[]

  const quests = storesWithoutQuest.map(struct => {
    const quest = createFillQuest({ structureId: struct.id })
    quest.priority = 2
    return quest
  })
  console.log(`Creating ${quests.length} new resource quests`)
  quests.forEach(quest => (Memory.quests[quest.id] = quest))
}
