import { ObjectiveTarget, ObjectiveTargetEnum } from 'quests'

export const getTarget = <Type extends any>(
  creep: Creep,
  target: ObjectiveTarget<Type>,
): null | Type => {
  const targetObject =
    typeof target === 'string' ? Game.getObjectById(target) : null

  if (targetObject) return targetObject

  switch (target) {
    case ObjectiveTargetEnum.source:
      return creep.pos.findClosestByPath(FIND_SOURCES) as Type

    case ObjectiveTargetEnum.store:
      const spawnOrExtension = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: struct =>
          (struct.structureType === STRUCTURE_SPAWN ||
            struct.structureType === STRUCTURE_EXTENSION) &&
          struct.store.getFreeCapacity() !== 0,
      })

      if (spawnOrExtension) return spawnOrExtension as Type

      const storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: struct =>
          struct.structureType === STRUCTURE_STORAGE &&
          struct.store.getFreeCapacity() !== 0,
      })

      if (storage) return storage as Type

      return null

    default:
      return null
  }
}
