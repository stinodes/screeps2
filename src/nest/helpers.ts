export const nestRoom = (nest: string) => Game.rooms[nest]

export const nestLevel = (nest: string) => nestRoom(nest).controller?.level

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

export const oneOfStructures = <S extends AnyStructure, T extends StructureConstant>(structure: S, types: T[]) => types.includes(structure.structureType as T)
