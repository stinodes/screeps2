import { Spooders } from 'creeps'
import { isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { TaskNames } from 'creeps/tasks'
import { creepPhase, taskForPriority } from 'creeps/tasks/taskPriority'
import { Worker, worker, WorkerTask } from 'creeps/worker'
import { nestGoalData, nestGoalSpoods } from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { hooks, LocalEconData } from './hooks'
import {
  harvestFreeSourceTask,
  lootTombstoneTask,
  pickUpFromStorageTask,
  pickUpResourceTask,
  repairBuildingTask,
  storeExtensionsTask,
  storeTowersTask,
  upgradeControllerTask,
  weaveTask,
  withdrawFromStorageTask,
  withdrawHuntingContainerTask,
} from 'creeps/tasks/taskCreators'

const createWorkerEmergencyTask = (worker: Worker) => {
  const phase = creepPhase(worker, [
    {
      name: 'gather',
      when: s => isCreepEmpty(s.name),
    },

    {
      name: 'use',
      when: s => isCreepFull(s.name),
    },
  ])

  let task: null | WorkerTask = null

  switch (phase) {
    case 'use':
      task = taskForPriority<WorkerTask>([
        storeExtensionsTask(worker),
        storeTowersTask(worker),
        upgradeControllerTask(worker),
      ])
      break
    case 'gather':
    default:
      task = taskForPriority<WorkerTask>([
        pickUpResourceTask(worker),
        harvestFreeSourceTask(worker),
      ])
      break
  }

  if (task) worker.task = task
}

const createWorkerTask = (worker: Worker) => {
  const phase = creepPhase(worker, [
    {
      name: 'gather',
      when: s => isCreepEmpty(s.name),
    },

    {
      name: 'use',
      when: s => isCreepFull(s.name),
    },
  ])

  let task: null | WorkerTask = null

  switch (phase) {
    case 'use':
      if (worker.data?.upgrader)
        task = { name: TaskNames.upgrade, target: null }
      else
        task = taskForPriority<WorkerTask>([
          storeExtensionsTask(worker),
          storeTowersTask(worker),
          repairBuildingTask(worker),
          weaveTask(worker),
          upgradeControllerTask(worker),
        ])
      break
    case 'gather':
    default:
      task = taskForPriority<WorkerTask>([
        lootTombstoneTask(worker),
        pickUpResourceTask(worker),
        pickUpFromStorageTask(worker),
        withdrawFromStorageTask(worker),
        withdrawHuntingContainerTask(worker),
        harvestFreeSourceTask(worker),
      ])
      break
  }

  if (task) worker.task = task
}

export const run: Goal['run'] = (nest: string) => {
  hooks(nest)

  const data = nestGoalData(nest, GoalNames.localEcon) as LocalEconData

  const spoods = nestGoalSpoods(nest, GoalNames.localEcon)
  const workers = spoods.filter(s => s.type === Spooders.worker) as Worker[]
  const workersWithCompleteTask = workers.filter(
    s => !s.task || s.task.complete,
  )

  workersWithCompleteTask.forEach(s => {
    if (data.status === 'unhealthy') createWorkerEmergencyTask(s)
    else createWorkerTask(s)
  })

  spoods.forEach(spood => {
    if (spood.type === Spooders.worker) worker(spood as Worker)
  })
}
