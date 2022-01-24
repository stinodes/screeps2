import { deserializePos } from 'utils/helpers'
import {
  creepBuild,
  creepDrop,
  creepHarvest,
  creepPickUp,
  creepTransfer,
  creepUpgrade,
  creepWithdraw,
} from './helpers'

export enum TaskNames {
  harvest = 'harvest',
  store = 'store',
  drop = 'drop',
  pickUp = 'pickUp',
  withdraw = 'withdraw',
  upgrade = 'upgrade',
  weave = 'weave',
}

export type Task<Name extends TaskNames, TargetId, Target = Id<TargetId>> = {
  name: Name
  target: Target
  progress?: boolean
  complete?: boolean
}

export const harvest = (
  creep: Creep,
  task: Task<TaskNames.harvest, Source>,
) => {
  const target = Game.getObjectById(task.target)
  if (target && creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
    task.progress = true
    creepHarvest(creep, target)
  } else {
    task.complete = true
  }
  return task
}

export const store = (
  creep: Creep,
  task: Task<TaskNames.store, AnyStoreStructure>,
) => {
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

export const drop = (
  creep: Creep,
  task: Task<TaskNames.store, null, string>,
) => {
  const pos = deserializePos(task.target)
  if (pos && !!creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
    task.progress = true
    creepDrop(creep, pos)
  } else {
    task.complete = true
  }
  return task
}

export const upgrade = (creep: Creep, task: Task<TaskNames.upgrade, any>) => {
  const target = Game.getObjectById(task.target)
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
    task.progress = true
    creepUpgrade(creep)
  } else {
    task.complete = true
  }
  return task
}

export const weave = (
  creep: Creep,
  task: Task<TaskNames.weave, ConstructionSite>,
) => {
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

export const pickUp = (
  creep: Creep,
  task: Task<TaskNames.pickUp, Resource>,
) => {
  const resource = Game.getObjectById(task.target)
  if (resource && resource.amount < 0 && creep.store.getFreeCapacity() > 0) {
    task.progress = true
    creepPickUp(creep, resource)
  } else {
    task.complete = true
  }
  return task
}

export const withdraw = (
  creep: Creep,
  task: Task<TaskNames.withdraw, AnyStoreStructure>,
) => {
  const store = Game.getObjectById(task.target)
  if (
    store &&
    store.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
    creep.store.getFreeCapacity() > 0
  ) {
    task.progress = true
    creepWithdraw(creep, store)
  } else {
    task.complete = true
  }
  return task
}
