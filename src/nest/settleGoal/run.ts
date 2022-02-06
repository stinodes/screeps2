import { Goal } from 'nest/types'
import { hooks } from './hooks'

export const run: Goal['run'] = (nest: string) => {
  hooks(nest)
}
