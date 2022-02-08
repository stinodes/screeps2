import {Spooders} from 'creeps'
import {nestGoalData, nestMarker, nestMem, nestRoom, nestSpoods} from 'nest/helpers'
import {GoalNames} from 'nest/types'
import {deserializePos} from 'utils/helpers'

export type LocalEconData = {
  energyPoints?: number[]
}

export const hooks = (nest: string) => {
  logEnergy(nest)
  logStatus(nest)
  log(nest)
}

const getEnergy = (nest: string) => {
  const storeMarker = deserializePos(nestMarker(nest, 'storage'))
  let stack = 0

  storeMarker.lookFor(LOOK_RESOURCES).forEach(r => (stack += r.amount))

  storeMarker.lookFor(LOOK_STRUCTURES).forEach(structure => {
    if ((structure as AnyStoreStructure).store) {
      stack += (structure as AnyStoreStructure).store.getUsedCapacity(
        RESOURCE_ENERGY,
      )
    }
  })

  stack += nestRoom(nest).energyAvailable

  return stack
}

const logEnergy = (nest: string) => {
  const data = nestGoalData(nest, GoalNames.localEcon) as LocalEconData
  if (Game.time % 20 === 0) {
    if (!data.energyPoints) data.energyPoints = []

    data.energyPoints.push(getEnergy(nest))
    if (data.energyPoints.length > 20)
      data.energyPoints.splice(0, data.energyPoints.length - 20)
  }
}

const logStatus = (nest: string) => {
  const nestMemory = nestMem(nest)

  if (nestMemory.status === 'stable' || nestMemory.status === 'unknown' || !nestMemory.status) {
    const spoods = nestSpoods(nest)

    /**
     * Unhealthy if no hunters/carriers (no income) && no spiderlings or workers
     */
    if (
      spoods.filter(s =>
        [Spooders.spiderling, Spooders.worker].includes(s.type),
      ).length === 0 &&
      (spoods.filter(s => s.type === Spooders.hunter).length === 0 ||
        spoods.filter(s => s.type === Spooders.carrier).length === 0)
    )
      nestMemory.status = 'unhealthy'

    return
  } else {
    const spoods = nestSpoods(nest)

    /**
     * healthy if any are present
     */
    if (
      spoods.filter(s =>
        [Spooders.spiderling, Spooders.worker].includes(s.type),
      ).length > 1
    )
      nestMemory.status = 'recovering'
    if (
      spoods.filter(s => s.type === Spooders.hunter).length > 0 &&
      spoods.filter(s => s.type === Spooders.carrier).length > 0
    )
      nestMemory.status = 'stable'

    return
  }
}

const log = (nest: string) => {
  const nestMemory = nestMem(nest)
  const data = nestGoalData(nest, GoalNames.localEcon) as LocalEconData

  console.log('STATUS: ', nestMemory.status)
  console.log('ENERGY LOG: ', data.energyPoints?.join(' | '))
}
