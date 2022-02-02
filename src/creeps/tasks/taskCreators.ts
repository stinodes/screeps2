import { Carrier } from 'creeps/carrier'
import { ColonyCarrier } from 'creeps/colonyCarrier'
import { creepForName } from 'creeps/helpers'
import {
  getFreeSource,
  nestFind,
  nestHuntingGrounds,
  nestMarker,
  oneOfStructures,
  relativePos,
  sortByRange,
  structureNeedsRepair,
} from 'nest/helpers'
import { deserializePos, serializePos } from 'utils/helpers'
import { Task, TaskNames } from '.'
import { TaskPriority } from './taskPriority'

const PICKUP_THRESHOLD = 300

type TaskPriorityCreator<
  T extends Task<TaskNames, any, any>,
  C extends CreepMemory = CreepMemory,
> = (creep: C, targetRoom?: string) => TaskPriority<T>

/**
 *    STORING
 */
export const storeExtensionsTask: TaskPriorityCreator<
  Task<TaskNames.store, AnyStoreStructure>
> = (creep, targetRoom = creep.nest) => {
  return {
    name: TaskNames.store,
    getTarget: () => {
      const stores: AnyStoreStructure[] = nestFind(
        targetRoom,
        FIND_STRUCTURES,
        {
          filter: structure =>
            oneOfStructures(structure, [
              STRUCTURE_SPAWN,
              STRUCTURE_EXTENSION,
            ]) &&
            (structure as AnyStoreStructure).store.getFreeCapacity(
              RESOURCE_ENERGY,
            ) > 0,
        },
      )
      if (!stores.length) return null
      return sortByRange(stores, creepForName(creep.name).pos)[0]?.id
    },
  }
}

export const storeTowersTask: TaskPriorityCreator<
  Task<TaskNames.store, AnyStoreStructure>
> = (creep: CreepMemory, targetRoom: string = creep.nest) => {
  return {
    name: TaskNames.store,
    getTarget: () => {
      const stores: AnyStoreStructure[] = nestFind(
        targetRoom,
        FIND_STRUCTURES,
        {
          filter: structure =>
            oneOfStructures(structure, [STRUCTURE_TOWER]) &&
            (structure as AnyStoreStructure).store.getFreeCapacity(
              RESOURCE_ENERGY,
            ) > 0,
        },
      )
      if (!stores.length) return null
      return sortByRange(stores, creepForName(creep.name).pos)[0]?.id
    },
  }
}

export const storeStorageTask: TaskPriorityCreator<
  Task<TaskNames.store, AnyStoreStructure>
> = (creep: CreepMemory, targetRoom: string = creep.nest) => {
  return {
    name: TaskNames.store,
    getTarget: () =>
      (
        nestFind(targetRoom, FIND_STRUCTURES, {
          filter: { structureType: STRUCTURE_STORAGE },
        }) as AnyStoreStructure[]
      )[0]?.id,
  }
}

export const dropStoragePosTask: TaskPriorityCreator<
  Task<TaskNames.drop, null, string>
> = (creep: CreepMemory, targetRoom: string = creep.nest) => {
  return {
    name: TaskNames.drop,
    getTarget: () =>
      serializePos(
        relativePos(deserializePos(nestMarker(targetRoom, 'storage')), 0, -1),
      ),
  }
}

/**
 *    USE
 */
export const upgradeControllerTask: TaskPriorityCreator<
  Task<TaskNames.upgrade, null, null>
> = () => ({
  name: TaskNames.upgrade,
})

export const repairBuildingTask: TaskPriorityCreator<
  Task<TaskNames.repair, AnyStructure>
> = (creep, targetRoom = creep.nest) => ({
  name: TaskNames.repair,
  getTarget: () => {
    const towers = nestFind(targetRoom, FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER },
    })
    const toRepair = nestFind(targetRoom, FIND_STRUCTURES).filter(struct =>
      structureNeedsRepair(struct),
    )

    return towers.length === 0
      ? sortByRange(toRepair, creepForName(creep.name).pos)[0]?.id
      : null
  },
})

export const weaveTask: TaskPriorityCreator<
  Task<TaskNames.weave, ConstructionSite>
> = (creep, targetRoom = creep.nest) => ({
  name: TaskNames.weave,
  getTarget: () => {
    return nestFind(targetRoom, FIND_CONSTRUCTION_SITES)[0]?.id
  },
})

/**
 *    PICK UP
 */
export const pickUpFromStorageTask: TaskPriorityCreator<
  Task<TaskNames.pickUp, Resource>
> = (creep, targetRoom = creep.nest) => ({
  name: TaskNames.pickUp,
  getTarget: () =>
    relativePos(
      deserializePos(nestMarker(targetRoom, 'storage')),
      0,
      -1,
    ).lookFor(LOOK_RESOURCES)[0]?.id,
})

export const withdrawFromStorageTask: TaskPriorityCreator<
  Task<TaskNames.withdraw, AnyStoreStructure>
> = (creep, targetRoom = creep.nest) => ({
  name: TaskNames.withdraw,
  getTarget: () =>
    deserializePos(nestMarker(targetRoom, 'storage'))
      .lookFor(LOOK_STRUCTURES)
      .filter(struct => oneOfStructures(struct as any, [STRUCTURE_STORAGE]))[0]
      ?.id as Id<AnyStoreStructure>,
})

export const lootTombstoneTask: TaskPriorityCreator<
  Task<TaskNames.withdraw, Tombstone | Ruin>
> = creep => ({
  name: TaskNames.withdraw,
  getTarget: () =>
    creepForName(creep.name).pos.findClosestByPath(FIND_TOMBSTONES, {
      filter: tombstone => tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    })?.id ||
    creepForName(creep.name).pos.findClosestByPath(FIND_RUINS, {
      filter: tombstone => tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    })?.id,
})

export const pickUpResourceTask: TaskPriorityCreator<
  Task<TaskNames.pickUp, Resource>
> = creep => ({
  name: TaskNames.pickUp,
  getTarget: () =>
    creepForName(creep.name).pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: resource => resource.amount > PICKUP_THRESHOLD,
    })?.id,
})

export const withdrawHuntingContainerTask: TaskPriorityCreator<
  Task<TaskNames.withdraw, AnyStoreStructure>
> = (creep, targetRoom = creep.nest) => ({
  name: TaskNames.withdraw,
  getTarget: () => {
    const huntingGrounds = nestHuntingGrounds(targetRoom) || []

    return huntingGrounds
      ? sortByRange(
          huntingGrounds
            .map(
              pos =>
                deserializePos(pos)
                  .lookFor(LOOK_STRUCTURES)
                  .filter(
                    struct =>
                      oneOfStructures(struct as any, [STRUCTURE_CONTAINER]) &&
                      (struct as AnyStoreStructure).store.getUsedCapacity(
                        RESOURCE_ENERGY,
                      ) > PICKUP_THRESHOLD,
                  )[0] as AnyStoreStructure,
            )
            .filter(Boolean),
          creepForName(creep.name).pos,
        )[0]?.id
      : null
  },
})

export const harvestFreeSourceTask: TaskPriorityCreator<
  Task<TaskNames.harvest, Source>
> = (creep, targetRoom = creep.nest) => ({
  name: TaskNames.harvest,
  getTarget: () => getFreeSource(targetRoom, creep)?.id,
})

/**
 *    HUNTING GROUNDS
 */
export const pickUpHuntingGroundResourceTask: TaskPriorityCreator<
  Task<TaskNames.pickUp, Resource>,
  Carrier | ColonyCarrier
> = creep => ({
  name: TaskNames.pickUp,
  getTarget: () =>
    creep.data &&
    deserializePos(creep.data.huntingGround)
      .lookFor(LOOK_RESOURCES)
      .sort((a, b) => a.amount - b.amount)[0]?.id,
})

export const withdrawHuntingGroundTask: TaskPriorityCreator<
  Task<TaskNames.withdraw, AnyStoreStructure>,
  Carrier | ColonyCarrier
> = creep => ({
  name: TaskNames.withdraw,
  getTarget: () =>
    creep.data &&
    (deserializePos(creep.data.huntingGround)
      .lookFor(LOOK_STRUCTURES)
      .filter(structure => structure.structureType === STRUCTURE_CONTAINER)[0]
      ?.id as Id<AnyStoreStructure>),
})
