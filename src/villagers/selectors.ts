export const getVillagers = () => Object.values(Memory.creeps)
export const getVillagersForTown = (town: string) =>
  getVillagers().filter(v => v.town === town)
export const getVillager = (id: string) => Memory.creeps[id]
export const getVillagerCreep = (id: string) => Game.creeps[id]
