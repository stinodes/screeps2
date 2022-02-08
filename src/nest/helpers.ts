import { config } from 'config'
import { creepForName } from 'creeps/helpers'
import { Task } from 'creeps/tasks'
import { GoalNames } from './types'

/**
 * ROOM GETTERS
 */
export const nestMem = (nest: string) => Memory.nests[nest]

export const nestGoalData = (nest: string, goal: GoalNames) => {
  return Memory.nests[nest][goal]
}

export const nestMarker = (nest: string, marker: string) =>
  nestMem(nest)?.markers[marker]

export const nestRoom = (nest: string) => Game.rooms[nest]

export const nestRoomMemory = (nest: string) => nestRoom(nest)?.memory
export const nestHuntingGrounds = (nest: string) =>
  nestRoomMemory(nest)?.huntingGrounds

export const nestLevel = (nest: string) => nestRoom(nest).controller?.level || 0

export const nestFind = <
  C extends FindConstant,
  FT extends FindTypes[C] = FindTypes[C],
>(
  nest: string,
  findC: C,
  opts?: FilterOptions<C, FT>,
) => nestRoom(nest).find(findC, opts)

export const nestSpoods = <C extends CreepMemory>(nest: string): C[] =>
  Object.values(Memory.creeps).filter(spood => spood.nest === nest) as C[]

export const nestGoalSpoods = <C extends CreepMemory>(
  nest: string,
  goal: string,
): C[] =>
  Object.values(Memory.creeps).filter(
    spood => spood.nest === nest && spood.goal === goal,
  ) as C[]

export const nestStorage = (nest: string) =>
  nestFind(nest, FIND_STRUCTURES, {
    filter: { structureType: STRUCTURE_STORAGE },
  })[0] as void | StructureStorage

/**
 * STRUCTURES & POSITIONS
 */

export const oneOfStructures = <
  S extends AnyStructure,
  T extends StructureConstant,
>(
  structure: S,
  types: T[],
) => types.includes(structure.structureType as T)

export const sortByRange = <O extends RoomObject>(o: O[], pos: RoomPosition) =>
  o
    .map(obj => ({ value: obj, range: pos.findPathTo(obj.pos).length }))
    .sort((a, b) => a.range - b.range)
    .map(({ value }) => value)

export const relativePos = (pos: RoomPosition, dx: number, dy: number) =>
  new RoomPosition(pos.x + dx, pos.y + dy, pos.roomName)

export const relativePosCurry =
  (pos: RoomPosition) => (dx: number, dy: number) =>
    relativePos(pos, dx, dy)

export const getAdjecentSquares = (pos: RoomPosition) => {
  const rpos = relativePosCurry(pos)
  return [
    rpos(-1, -1),
    rpos(0, -1),
    rpos(1, -1),
    rpos(-1, 0),
    rpos(0, 0),
    rpos(1, 0),
    rpos(-1, 1),
    rpos(0, 1),
    rpos(1, 1),
  ]
}

export const getEmptyAdjecentSquares = (pos: RoomPosition) => {
  return getAdjecentSquares(pos).filter(sq => {
    return (
      Game.rooms[pos.roomName].getTerrain().get(sq.x, sq.y) !==
      TERRAIN_MASK_WALL
    )
  })
}

export const getFreeSources = (nest: string) => {
  const room = nestRoom(nest)
  const sources = room.find(FIND_SOURCES).filter(source => {
    const adjSq = getEmptyAdjecentSquares(source.pos)
    const spoods = (
      nestSpoods(nest) as (CreepMemory & { task?: Task<any, any> })[]
    ).filter(s => s.task?.target === source.id)
    return spoods.length <= adjSq.length
  })
  return sources
}

export const getFreeSource = (nest: string, s: CreepMemory) => {
  const room = nestRoom(nest)
  const sources = room.find(FIND_SOURCES).filter(source => {
    const adjSq = getEmptyAdjecentSquares(source.pos)
    const spoods = (
      nestSpoods(nest) as (CreepMemory & { task?: Task<any, any> })[]
    ).filter(s => s.task?.target === source.id)
    return spoods.length <= adjSq.length
  })
  return sortByRange(sources, creepForName(s.name).pos)[0]
}

export const isObjectEmpty = (obj: Resource | AnyStoreStructure | null) => {
  if (!obj) return true
  if (obj instanceof Resource) {
    return !obj.amount
  }
  if (obj instanceof Structure && obj.hasOwnProperty('store')) {
    return !(obj as AnyStoreStructure).store.getUsedCapacity(RESOURCE_ENERGY)
  }
  return true
}

export const structureNeedsRepair = (structure: AnyStructure) =>
  structure.hits < structure.hitsMax && structure.hits < config.maxHits
