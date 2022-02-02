import { Spooders } from 'creeps'
import { carrier } from 'creeps/carrier'
import { ColonyCarrier, ColonyCarrierTask } from 'creeps/colonyCarrier'
import { ColonyHunter } from 'creeps/colonyHunter'
import { ColonyWorker, ColonyWorkerTask } from 'creeps/colonyWorker'
import { isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { hunter } from 'creeps/hunter'
import {
  dropStoragePosTask,
  harvestFreeSourceTask,
  lootTombstoneTask,
  pickUpHuntingGroundResourceTask,
  pickUpResourceTask,
  repairBuildingTask,
  storeExtensionsTask,
  storeStorageTask,
  weaveTask,
  withdrawHuntingContainerTask,
  withdrawHuntingGroundTask,
} from 'creeps/tasks/taskCreators'
import { creepPhase, taskForPriority } from 'creeps/tasks/taskPriority'
import { worker } from 'creeps/worker'
import { nestGoalData, nestGoalSpoods } from 'nest/helpers'
import { GoalNames } from 'nest/types'
import { ColonyEconData, hooks } from './hooks'

const createWorkerTask = (worker: ColonyWorker) => {
  const colony = worker.data?.colony

  if (!colony) return

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

  let task: null | ColonyWorkerTask = null

  switch (phase) {
    case 'use':
      task = taskForPriority<ColonyWorkerTask>([
        repairBuildingTask(worker, colony),
        weaveTask(worker, colony),
      ])
      break
    case 'gather':
    default:
      task = taskForPriority<ColonyWorkerTask>([
        lootTombstoneTask(worker, colony),
        pickUpResourceTask(worker, colony),
        withdrawHuntingContainerTask(worker, colony),
        harvestFreeSourceTask(worker, colony),
      ])
      break
  }

  if (task) worker.task = task
}

const createCarrierTask = (carrier: ColonyCarrier) => {
  const colony = carrier.data?.colony

  if (!colony) return

  const phase = creepPhase(carrier, [
    {
      name: 'fill',
      when: s => isCreepEmpty(s.name),
    },

    {
      name: 'deposit',
      when: s => isCreepFull(s.name),
    },
  ])

  let task
  switch (phase) {
    case 'deposit':
      task = taskForPriority<ColonyCarrierTask>([
        storeExtensionsTask(carrier),
        storeStorageTask(carrier),
        dropStoragePosTask(carrier),
      ])
      break

    case 'fill':
    default:
      task = taskForPriority<ColonyCarrierTask>([
        pickUpHuntingGroundResourceTask(carrier, colony),
        withdrawHuntingGroundTask(carrier, colony),
      ])
      break
  }
  if (task) carrier.task = task
}

export const run = (nest: string) => {
  hooks(nest)

  const spoods = nestGoalSpoods<ColonyHunter | ColonyCarrier | ColonyWorker>(
    nest,
    GoalNames.colonyEcon,
  )

  const spoodsWithCompleteTask = spoods.filter(
    s => s.type !== Spooders.colonyHunter && (!s.task || s.task.complete),
  )
  spoodsWithCompleteTask.forEach(s => {
    switch (s.type) {
      case Spooders.colonyWorker:
        createWorkerTask(s)
        break
      case Spooders.colonyCarrier:
        break
    }
  })

  spoods.forEach(s => {
    switch (s.type) {
      case Spooders.colonyWorker:
        worker(s)
        break
      case Spooders.colonyHunter:
        hunter(s)
        break
      case Spooders.colonyCarrier:
        carrier(s)
        break
    }
  })
}
