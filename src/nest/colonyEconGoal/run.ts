import { Spooders } from 'creeps'
import { baseSpider } from 'creeps/baseBehavior'
import { Colonizer, colonizer } from 'creeps/colonizer'
import { ColonyCarrier, ColonyCarrierTask } from 'creeps/colonyCarrier'
import { ColonyHunter } from 'creeps/colonyHunter'
import { ColonyWorker, ColonyWorkerTask } from 'creeps/colonyWorker'
import { defender, Defender } from 'creeps/defender'
import { isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { hunter } from 'creeps/hunter'
import {
  colonyCarrierStoreTask,
  dropStoragePosTask,
  harvestFreeSourceTask,
  lootTombstoneTask,
  moveToRoomTask,
  pickUpHuntingGroundResourceTask,
  pickUpResourceTask,
  repairBuildingTask,
  weaveTask,
  withdrawHuntingContainerTask,
  withdrawHuntingGroundTask,
} from 'creeps/tasks/taskCreators'
import { creepPhase, taskForPriority } from 'creeps/tasks/taskPriority'
import { nestGoalSpoods } from 'nest/helpers'
import { GoalNames } from 'nest/types'
import { hooks } from './hooks'

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

  if (Game.rooms[colony]) {
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
  } else {
    console.log('Colony unavailable')
    task = taskForPriority<ColonyWorkerTask>([moveToRoomTask(worker, colony)])
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

  if (Game.rooms[colony]) {
    switch (phase) {
      case 'deposit':
        task = taskForPriority<ColonyCarrierTask>([
          moveToRoomTask(carrier),
          colonyCarrierStoreTask(carrier),
          dropStoragePosTask(carrier),
        ])
        break

      case 'fill':
      default:
        task = taskForPriority<ColonyCarrierTask>([
          lootTombstoneTask(carrier, colony),
          pickUpResourceTask(carrier, colony),
          pickUpHuntingGroundResourceTask(carrier, colony),
          withdrawHuntingGroundTask(carrier, colony),
        ])
        break
    }
  } else {
    console.log('Colony unavailable')
    switch (phase) {
      case 'deposit':
        task = taskForPriority<ColonyCarrierTask>([
          moveToRoomTask(carrier),
          colonyCarrierStoreTask(carrier),
          dropStoragePosTask(carrier),
        ])
        break

      case 'fill':
      default:
        task = taskForPriority<ColonyCarrierTask>([
          moveToRoomTask(carrier, colony),
        ])
        break
    }
  }
  if (task) carrier.task = task
}

export const run = (nest: string) => {
  hooks(nest)

  const spoods = nestGoalSpoods<
    Defender | Colonizer | ColonyHunter | ColonyCarrier | ColonyWorker
  >(nest, GoalNames.colonyEcon)

  const spoodsWithCompleteTask = spoods.filter(
    s =>
      s.type !== Spooders.colonyHunter &&
      s.type !== Spooders.colonizer &&
      s.type !== Spooders.defender &&
      (!s.task || s.task.complete),
  )
  spoodsWithCompleteTask.forEach(s => {
    switch (s.type) {
      case Spooders.colonyWorker:
        createWorkerTask(s)
        break
      case Spooders.colonyCarrier:
        createCarrierTask(s)
        break
    }
  })

  spoods.forEach(s => {
    switch (s.type) {
      case Spooders.defender:
        defender(s)
        break
      case Spooders.colonizer:
        colonizer(s)
        break
      case Spooders.colonyWorker:
        baseSpider(s)
        break
      case Spooders.colonyHunter:
        hunter(s)
        break
      case Spooders.colonyCarrier:
        baseSpider(s)
        break
    }
  })
}
