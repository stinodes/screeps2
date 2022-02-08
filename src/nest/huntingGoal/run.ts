import { Spooders } from 'creeps'
import { baseSpider } from 'creeps/baseBehavior'
import { Carrier, CarrierTask } from 'creeps/carrier'
import { isCreepEmpty, isCreepFull } from 'creeps/helpers'
import { Hunter, hunter } from 'creeps/hunter'
import {
  dropStoragePosTask,
  pickUpHuntingGroundResourceTask,
  storeExtensionsTask,
  storeStorageTask,
  withdrawFromLinkTask,
  withdrawHuntingGroundTask,
} from 'creeps/tasks/taskCreators'
import { creepPhase, taskForPriority } from 'creeps/tasks/taskPriority'
import { nestGoalSpoods } from 'nest/helpers'
import { Goal, GoalNames } from 'nest/types'
import { hooks } from './hooks'

const createCarrierTask = (carrier: Carrier) => {
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
      task = taskForPriority<CarrierTask>([
        storeExtensionsTask(carrier),
        storeStorageTask(carrier),
        dropStoragePosTask(carrier),
      ])
      break

    case 'fill':
    default:
      task = taskForPriority<CarrierTask>([
        withdrawFromLinkTask(carrier),
        pickUpHuntingGroundResourceTask(carrier),
        withdrawHuntingGroundTask(carrier),
      ])
      break
  }
  if (task) carrier.task = task
}

export const run: Goal['run'] = nest => {
  hooks(nest)

  const spoods = nestGoalSpoods(nest, GoalNames.hunting)
  const carriers = spoods.filter(
    spood => spood.type === Spooders.carrier,
  ) as Carrier[]

  const carriersWithoutTask = carriers.filter(c => !c.task || c.task.complete)

  carriersWithoutTask.forEach(createCarrierTask)

  spoods.forEach(s => {
    switch (s.type) {
      case Spooders.hunter:
        hunter(s as Hunter)
        break
      case Spooders.carrier:
        baseSpider(s as Carrier)
        break
    }
  })
}
