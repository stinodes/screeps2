import { Manager } from 'managers/managerTypes'
import { Quest } from 'quests'
import { createTown, town } from 'town'
import { Town } from 'town/TownTypes'
import { ErrorMapper } from 'utils/ErrorMapper'

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    quests: {
      [id: string]: Quest
    }
    managers: {
      [id: string]: Manager
    }
    towns: {
      [name: string]: Town
    }
    uuid: number
    log: any
  }

  interface CreepMemory {
    questId: string
    questDependencyQueue: string[]
    name: string
    town: string
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any
    }
  }
}

const setup = () => {
  Memory.quests = {}
  Memory.managers = {}
  Memory.towns = {}
  Memory.creeps = {}
  const newTown = createTown(Object.values(Game.spawns)[0].room.name)
  if (newTown) Memory.towns[newTown.room] = newTown
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`)

  if (!Object.values(Memory.towns).length) {
    setup()
  }

  Object.values(Memory.towns).forEach(town)

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name]
    }
  }
})
