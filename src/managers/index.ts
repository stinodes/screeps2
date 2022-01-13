import { Manager } from './managerTypes'
import { resourceManager } from './resourceManager'

export enum ManagerTypes {
  resource = 'resource',
}

export const manager = (manager: Manager) => {
  switch (manager.type) {
    case ManagerTypes.resource:
      resourceManager(manager)
      break
  }
}

export * from './selectors'
export * from './managerTypes'
