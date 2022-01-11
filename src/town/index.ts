import { getManagersForTown, manager, ManagerTypes } from 'managers'
import { getQuest, getQuestsForTown, Quest } from 'quests'
import { v4 } from 'uuid'
import { getVillagersForTown } from 'villagers'
import { villager } from 'villagers/villager'
import { Town } from './townTypes'

export const createTown = (room: null | string) => room && { room }

const assignQuests = (openVillagers: CreepMemory[], openQuests: Quest[]) => {}

export const town = (town: Town) => {
  const townManagers = getManagersForTown(town.room)
  const townVillagers = getVillagersForTown(town.room)

  if (!townManagers.some(manager => manager.type === ManagerTypes.resource)) {
    const resourceManager = {
      id: v4(),
      type: ManagerTypes.resource,
      town: town.room,
    }
    Memory.managers[resourceManager.id] = resourceManager
  }

  Object.values(townManagers).forEach(manager)

  const openVillagers = townVillagers.filter(villager => {
    return !villager.questId || getQuest(villager.questId)?.isComplete
  })
  const openQuests = getQuestsForTown(town.room).filter(q => {
    return !townVillagers.some(v => v.questId === q.id)
  })

  assignQuests(openVillagers, openQuests)

  Object.values(townVillagers).forEach(villager)
}

export * from './selectors'
export * from './townTypes'
