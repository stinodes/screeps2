import { getQuestsForTown, ObjectiveName, QuestNames } from 'quests'
import { createFillQuest } from 'quests/fill'
import { createUpgradeQuest } from 'quests/upgrade'
import { Manager } from './managerTypes'

export const resourceManager = (manager: Manager) => {
  const room = Game.rooms[manager.town]

  const townQuests = getQuestsForTown(room.name)

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

  const newStoreQuests = storesWithoutQuest.map(struct => {
    const quest = createFillQuest({
      town: manager.town,
      structureId: struct.id,
    })
    quest.priority = 2
    return quest
  })
  console.log(`Creating ${newStoreQuests.length} new resource quests`)
  newStoreQuests.forEach(quest => (Memory.quests[quest.id] = quest))

  const newUpgradeQuest = !townQuests.some(q => q.name === QuestNames.upgrade)
    ? createUpgradeQuest({ town: room.name })
    : null
  console.log(`Creating ${newUpgradeQuest ? 1 : 0} new upgrade quests`)
  if (newUpgradeQuest) Memory.quests[newUpgradeQuest.id] = newUpgradeQuest
}
