const harvest = (creep: Creep, source: Source) => {
  if (!source) return
  creep.say('⛏️')
  const result = creep.harvest(source)
  if (result === ERR_NOT_IN_RANGE) return creep.moveTo(source)
  return result
}

const transfer = (creep: Creep, store: AnyStoreStructure) => {
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
