export const creepForName = (name: string) => Game.creeps[name]

export const isCreepEmpty = (
  name: string,
  type: ResourceConstant = RESOURCE_ENERGY,
) => creepForName(name).store.getUsedCapacity(type) === 0

export const isCreepFull = (
  name: string,
  type: ResourceConstant = RESOURCE_ENERGY,
) => creepForName(name).store.getFreeCapacity(type) === 0

export const creepHarvest = (creep: Creep, source: Source) => {
  if (!source) return
  creep.say('🪰')
  const result = creep.harvest(source)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(source)
  return result
}

export const creepTransfer = (creep: Creep, store: AnyStoreStructure) => {
  if (!store) return
  creep.say('🕷️')
  const result = creep.transfer(store, RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(store)
  return result
}

export const creepDrop = (creep: Creep, pos: RoomPosition) => {
  if (!pos) return
  creep.say('🕷️')

  let result

  if (creep.pos.getRangeTo(pos) === 0) {
    result = creep.drop(RESOURCE_ENERGY)
  } else result = creep.moveTo(pos)
  return result
}

export const creepBuild = (creep: Creep, site: ConstructionSite) => {
  if (!site) return
  creep.say('🕸️')
  const result = creep.build(site)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(site)
  return result
}

export const creepRepair = (creep: Creep, structure: Structure) => {
  if (!structure) return
  creep.say('🕸️')
  const result = creep.repair(structure)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(structure)
  return result
}

export const creepUpgrade = (creep: Creep) => {
  const controller = creep.room.controller
  if (!controller) return
  creep.say('🔋')
  const result = creep.upgradeController(controller)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(controller)
  return result
}

export const creepPickUp = (creep: Creep, resource: Resource) => {
  creep.say('🪰')
  const result = creep.pickup(resource)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(resource)
  return result
}

export const creepWithdraw = (
  creep: Creep,
  store: AnyStoreStructure | Tombstone,
  resource: ResourceConstant = RESOURCE_ENERGY,
) => {
  creep.say('🪰')
  const result = creep.withdraw(store, resource)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(store)
  return result
}
