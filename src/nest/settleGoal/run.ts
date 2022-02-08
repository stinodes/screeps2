import {Goal} from 'nest/types'
import {hooks} from './hooks'

export const run: Goal['run'] = (nest: string) => {
  hooks(nest)

  const settlements = Object.values(Memory.nests).filter(n => n.status === 'settling')[0]


}
