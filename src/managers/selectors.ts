export const getManagers = () => Object.values(Memory.managers)
export const getManagersForTown = (town: string) =>
  getManagers().filter(m => m.town === town)
