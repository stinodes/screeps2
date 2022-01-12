import {getManagersForTown, manager, ManagerTypes} from 'managers'
import {canPickUpQuest, getQuest, getQuestsForTown, Quest} from 'quests'
import {v4} from 'uuid'
import {getVillagerCreep, getVillagersForTown} from 'villagers'
import {villager} from 'villagers/villager'
import {Town} from './townTypes'

export const createTown = (room: null | string) => room && {room}

const assignQuests = (openVillagers: CreepMemory[], openQuests: Quest[]) => {
  const matches = openVillagers.reduce(
    (matches, villager) => {

      const possibleQuests = openQuests.filter(q => {
        return Object.values(matches).indexOf(q.id) !== -1 &&
          canPickUpQuest(q, getVillagerCreep(villager.name))
      })

      if (possibleQuests.length)
        matches[villager.name] = possibleQuests[0].id

      return matches
    },
    {} as {[villagerId: string]: string}
  )

  Object.keys(matches).forEach(
    villagerName => {
      const questId = matches[villagerName]
      Memory.creeps[villagerName].questId = questId
    })
}

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
