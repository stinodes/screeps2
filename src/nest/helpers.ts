import { GoalNames } from './types'

export const nestMem = (nest: string) => Memory.nests[nest]

export const nestGoalData = (nest: string, goal: GoalNames) => {
  if (!Memory.nests[nest][goal]) Memory.nests[nest][goal] = {}
  return Memory.nests[nest][goal]
}

export const nestMarker = (nest: string, marker: string) =>
  nestMem(nest).markers[marker]

export const nestRoom = (nest: string) => Game.rooms[nest]

export const nestLevel = (nest: string) => nestRoom(nest).controller?.level || 0

export const nestFind = <
  C extends FindConstant,
  FT extends FindTypes[C] = FindTypes[C],
>(
  nest: string,
  findC: C,
  opts?: FilterOptions<C, FT>,
) => nestRoom(nest).find(findC, opts)

export const nestSpoods = (nest: string) =>
  Object.values(Memory.creeps).filter(spood => spood.nest === nest)

export const nestGoalSpoods = (nest: string, goal: string) =>
  Object.values(Memory.creeps).filter(
    spood => spood.nest === nest && spood.goal === goal,
  )

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
