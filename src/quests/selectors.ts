export const getQuests = () => Object.values(Memory.quests)
export const getQuestsForTown = (town: string) =>
  getQuests().filter(q => q.town === town)
export const getQuest = (id: string) => Memory.quests[id]
