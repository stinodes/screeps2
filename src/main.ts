import { Spooders } from 'creeps'
import { createNest, nest } from 'nest'
import { Nest } from 'nest/types'
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
    nests: {
      [name: string]: Nest
    }
    uuid: number
    log: any
  }

  interface CreepMemory {
    name: string
    type: Spooders
    nest: string
    goal: string
    data?: {
      phase?: any
    }
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any
    }
  }
}

const setup = () => {
  Object.keys(Memory).forEach(key => {
    delete (Memory as { [name: string]: any })[key]
  })
  Memory.nests = {}
  Memory.creeps = {}
  const nest = createNest(Object.values(Game.spawns)[0].room.name)
  if (nest) Memory.nests[nest.name] = nest
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`)
  console.log(`<hr/>`)

  if (!Memory.nests || !Object.values(Memory.nests).length) {
    setup()
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name]
    }
  }

  Object.values(Memory.nests).forEach(nest)
})
