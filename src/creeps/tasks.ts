import {creepBuild, creepHarvest, creepTransfer, creepUpgrade} from "./helpers"

export enum TaskNames {
  harvest = 'harvest',
  store = 'store',
  upgrade = 'upgrade',
  weave = 'weave',
}

export type Task<Name extends TaskNames, Target> = {
  name: Name
  target: Id<Target>
  progress?: boolean
  complete?: boolean
}

export const harvest = (creep: Creep, task: Task<TaskNames.harvest, Source>) => {
  const target = Game.getObjectById(task.target)
  if (target && creep.store.getFreeCapacity() !== 0) {
    task.progress = true
    creepHarvest(creep, target)
  }
  else {
    task.complete = true
  }
  return task
}

export const store = (creep: Creep, task: Task<TaskNames.store, AnyStoreStructure>) => {
  const target = Game.getObjectById(task.target)
  if (target && creep.store.getUsedCapacity() !== 0 && target.store.getFreeCapacity() !== 0) {
    task.progress = true
    creepTransfer(creep, target)
  }
  else {
    task.complete = true
  }
  return task
}

export const upgrade = (creep: Creep, task: Task<TaskNames.upgrade, any>) => {
  const target = Game.getObjectById(task.target)
  if (target && creep.store.getUsedCapacity() !== 0) {
    task.progress = true
    creepUpgrade(creep)
  }
  else {
    task.complete = true
  }
  return task
}

export const weave = (creep: Creep, task: Task<TaskNames.weave, ConstructionSite>) => {
  const target = Game.getObjectById(task.target)
  if (target && creep.store.getUsedCapacity() !== 0 && target.progress < target.progressTotal) {
    task.progress = true
    creepBuild(creep, target)
  }
  else {
    task.complete = true
  }
  return task

}
