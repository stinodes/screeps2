import { Manager } from './managerTypes'
import { resourceManager } from './resourceManager'

export enum ManagerTypes {
  resource,
}

export const manager = (manager: Manager) => {
  switch (manager.type) {
    case ManagerTypes.resource:
      resourceManager(manager)
  }
}

export * from './selectors'
export * from './managerTypes'
