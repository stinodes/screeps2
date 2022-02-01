import {Spooders} from 'creeps'
import {creepForName, isCreepEmpty, isCreepFull} from 'creeps/helpers'
import {TaskNames} from 'creeps/tasks'
import {creepPhase, taskForPriority} from 'creeps/tasks/taskPriority'
import {Worker, worker, WorkerTask} from 'creeps/worker'
import {
  getEmptyAdjecentSquares,
  nestFind,
  nestGoalData,
  nestGoalSpoods,
  nestMarker,
  nestRoom,
  nestSpoods,
  oneOfStructures,
  relativePos,
  sortByRange,
  structureNeedsRepair,
} from 'nest/helpers'
import {HuntingData} from '../huntingGoal/hooks'
import {Goal, GoalNames} from 'nest/types'
import {deserializePos} from 'utils/helpers'
import {hooks, LocalEconData} from './hooks'

const createWorkerEmergencyTask = (
  {stores}: {stores: AnyStoreStructure[]},
  worker: Worker,
) => {
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
      task = taskForPriority([
        {
          name: TaskNames.store,
          getTarget: () => stores[0]?.id,
        },
        {name: TaskNames.upgrade},
      ])
      break
    case 'gather':
    default:
      task = taskForPriority([
        {
          name: TaskNames.pickUp,
          getTarget: () =>
            creepForName(worker.name).pos.findClosestByPath(
              FIND_DROPPED_RESOURCES,
            )?.id,
        },
        {
          name: TaskNames.harvest,
          getTarget: () => getFreeSource(worker.nest, worker)?.id,
        },
      ])
      break
  }

  if (task) worker.task = task
}

const createWorkerTask = (
  {sites}: {stores: AnyStoreStructure[]; sites: ConstructionSite[]},
  worker: Worker,
) => {
  const huntingGrounds = (
    nestGoalData(worker.nest, GoalNames.hunting) as HuntingData
  ).huntingGrounds
  const storagePos = deserializePos(nestMarker(worker.nest, 'storage'))
  const structures = nestFind(worker.nest, FIND_STRUCTURES)

  const towers = structures.filter(struct =>
    oneOfStructures(struct, [STRUCTURE_TOWER]),
  )
  const toFill = structures.filter(
    struct =>
      (struct as AnyStoreStructure).store?.getFreeCapacity(RESOURCE_ENERGY) >
      0 &&
      oneOfStructures(struct, [
        STRUCTURE_TOWER,
        STRUCTURE_EXTENSION,
        STRUCTURE_SPAWN,
      ]),
  ) as AnyStoreStructure[]
  const toRepair = structures.filter(struct => structureNeedsRepair(struct, 2))

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
        task = {name: TaskNames.upgrade, target: null}
      else
        task = taskForPriority([
          {
            name: TaskNames.store,
            getTarget: () =>
              sortByRange(toFill, creepForName(worker.name).pos)[0]?.id,
          },
          {
            name: TaskNames.repair,
            getTarget: () =>
              towers.length === 0
                ? sortByRange(toRepair, creepForName(worker.name).pos)[0]?.id
                : null,
          },
          {
            name: TaskNames.weave,
            getTarget: () => sites[0]?.id,
          },
          {name: TaskNames.upgrade},
        ])
      break
    case 'gather':
    default:
      task = taskForPriority([
        {name: TaskNames.withdraw, getTarget: () => creepForName(worker.name).pos.findClosestByPath(FIND_TOMBSTONES)?.id},
        {
          name: TaskNames.pickUp,
          getTarget: () =>
            creepForName(worker.name).pos.findClosestByPath(
              FIND_DROPPED_RESOURCES,
              {filter: resource => resource.amount > 100},
            )?.id,
        },
        {
          name: TaskNames.pickUp,
          getTarget: () => relativePos(storagePos, 0, -1).lookFor(LOOK_RESOURCES)[0]?.id,
        },
        {
          name: TaskNames.withdraw,
          getTarget: () =>
            storagePos
              .lookFor(LOOK_STRUCTURES)
              .filter(struct =>
                oneOfStructures(struct as any, [STRUCTURE_STORAGE]),
              )[0]?.id as Id<AnyStoreStructure>,
        },
        {
          name: TaskNames.withdraw,
          getTarget: () =>
            huntingGrounds
              ? sortByRange(
                huntingGrounds
                  .map(
                    pos =>
                      deserializePos(pos)
                        .lookFor(LOOK_STRUCTURES)
                        .filter(
                          struct =>
                            oneOfStructures(struct as any, [
                              STRUCTURE_CONTAINER,
                            ]) &&
                            (
                              struct as AnyStoreStructure
                            ).store.getUsedCapacity(RESOURCE_ENERGY) > 100,
                        )[0] as AnyStoreStructure,
                  )
                  .filter(Boolean),
                creepForName(worker.name).pos,
              )[0]?.id
              : null,
        },
        {
          name: TaskNames.harvest,
          getTarget: () => getFreeSource(worker.nest, worker)?.id,
        },
      ])
      break
  }

  if (task) worker.task = task
}

const getFreeSource = (nest: string, s: Worker) => {
  const room = nestRoom(nest)
  const sources = room.find(FIND_SOURCES).filter(source => {
    const adjSq = getEmptyAdjecentSquares(source.pos)
    const spoods = (nestSpoods(nest) as Worker[]).filter(
      s => s.task?.target === source.id,
    )
    return spoods.length <= adjSq.length
  })
  return sortByRange(sources, creepForName(s.name).pos)[0]
}

export const run: Goal['run'] = (nest: string) => {
  hooks(nest)

  const data = nestGoalData(nest, GoalNames.localEcon) as LocalEconData

  const spoods = nestGoalSpoods(nest, GoalNames.localEcon)
  const workers = spoods.filter(s => s.type === Spooders.worker) as Worker[]
  const workersWithCompleteTask = workers.filter(
    s => !s.task || s.task.complete,
  )

  const unfilledStores = nestFind(nest, FIND_STRUCTURES, {
    filter: (struct: AnyStoreStructure) =>
      oneOfStructures(struct, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) &&
      struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  }) as AnyStoreStructure[]
  const constructionSites = nestFind(nest, FIND_CONSTRUCTION_SITES)

  workersWithCompleteTask.forEach(s => {
    if (data.status === 'unhealthy')
      createWorkerEmergencyTask({stores: unfilledStores}, s)
    else
      createWorkerTask({stores: unfilledStores, sites: constructionSites}, s)
  })

  spoods.forEach(spood => {
    if (spood.type === Spooders.worker) worker(spood as Worker)
  })
}
