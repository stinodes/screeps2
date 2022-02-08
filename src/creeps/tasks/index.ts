import { config } from 'config'
import { nestMarker } from 'nest/helpers'
import { deserializePos } from 'utils/helpers'
import {
  creepBuild,
  creepDrop,
  creepHarvest,
  creepPickUp,
  creepRepair,
  creepTransfer,
  creepUpgrade,
  creepWithdraw,
} from '../helpers'

export enum TaskNames {
  harvest = 'harvest',
  store = 'store',
  drop = 'drop',
  pickUp = 'pickUp',
  withdraw = 'withdraw',
  upgrade = 'upgrade',
  weave = 'weave',
  repair = 'repair',
  moveToRoom = 'moveToRoom',
}

export type Task<Name extends TaskNames, TargetId, Target = Id<TargetId>> = {
  name: Name
  target: Target
  progress?: boolean
  complete?: boolean
}

export type HarvestTask = Task<TaskNames.harvest, Source>
export const harvest = (creep: Creep, task: HarvestTask) => {
  const target = Game.getObjectById(task.target)
  if (target && creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
    task.progress = true
    creepHarvest(creep, target)
  } else {
    task.complete = true
  }
  return task
}

export type StoreTask = Task<TaskNames.store, AnyStoreStructure>
export const store = (creep: Creep, task: StoreTask) => {
  const target = Game.getObjectById(task.target)
  if (
    target &&
    creep.store.getUsedCapacity(RESOURCE_ENERGY) &&
    target.store.getFreeCapacity(RESOURCE_ENERGY)
  ) {
    task.progress = true
    creepTransfer(creep, target)
  } else {
    task.complete = true
  }
  return task
}

export type DropTask = Task<TaskNames.drop, null, string>
export const drop = (creep: Creep, task: DropTask) => {
  const pos = deserializePos(task.target)
  if (pos && !!creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
    task.progress = true
    creepDrop(creep, pos)
  } else {
    task.complete = true
  }
  return task
}

export type UpgradeTask = Task<TaskNames.upgrade, null, null>
export const upgrade = (creep: Creep, task: UpgradeTask) => {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
    task.progress = true
    creepUpgrade(creep)
  } else {
    task.complete = true
  }
  return task
}

export type WeaveTask = Task<TaskNames.weave, ConstructionSite>
export const weave = (creep: Creep, task: WeaveTask) => {
  const target = Game.getObjectById(task.target)
  if (
    target &&
    creep.store.getUsedCapacity(RESOURCE_ENERGY) &&
    target.progress < target.progressTotal
  ) {
    task.progress = true
    creepBuild(creep, target)
  } else {
    task.complete = true
  }
  return task
}

export type RepairTask = Task<TaskNames.repair, AnyStructure>
export const repair = (creep: Creep, task: RepairTask) => {
  const target = Game.getObjectById(task.target)
  if (
    target &&
    creep.store.getUsedCapacity(RESOURCE_ENERGY) &&
    target.hits < target.hitsMax &&
    target.hits < config.maxHits
  ) {
    task.progress = true
    creepRepair(creep, target)
  } else {
    task.complete = true
  }
  return task
}

export type PickUpTask = Task<TaskNames.pickUp, Resource>
export const pickUp = (creep: Creep, task: PickUpTask) => {
  const resource = Game.getObjectById(task.target)
  if (
    resource &&
    resource.amount !== 0 &&
    creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0
  ) {
    task.progress = true
    creepPickUp(creep, resource)
  } else {
    task.complete = true
  }
  return task
}

export type WithdrawTask = Task<
  TaskNames.withdraw,
  AnyStoreStructure | Tombstone | Ruin
>
export const withdraw = (creep: Creep, task: WithdrawTask) => {
  const store = Game.getObjectById(task.target)
  if (
    store &&
    store.store.getUsedCapacity(RESOURCE_ENERGY) !== 0 &&
    creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0
  ) {
    task.progress = true
    creepWithdraw(creep, store)
  } else {
    task.complete = true
  }
  return task
}

export type MoveToRoomTask = Task<TaskNames.moveToRoom, null, string>
export const moveToRoom = (creep: Creep, task: MoveToRoomTask) => {
  const exitPos = [0, 49]
  if (
    creep.room.name !== task.target ||
    exitPos.includes(creep.pos.x) ||
    exitPos.includes(creep.pos.y)
  ) {
    const stMarker = nestMarker(task.target, 'storage')
    creep.moveTo(
      stMarker
        ? deserializePos(stMarker)
        : new RoomPosition(20, 20, task.target),
    )
    task.progress = true
  } else {
    task.complete = true
  }
}

export type AllTasks =
  | HarvestTask
  | StoreTask
  | DropTask
  | PickUpTask
  | WithdrawTask
  | WeaveTask
  | RepairTask
  | MoveToRoomTask
  | UpgradeTask
