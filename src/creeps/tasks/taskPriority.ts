import { Task } from '.'

export type TaskPriority<T extends Task<any, any, any>> = {
  name: T['name']
  getTarget?: () => undefined | null | T['target']
}
export const taskForPriority = <T extends Task<any, any, any>>(
  prios: TaskPriority<T>[],
): T | null => {
  const prio = prios.find(prio => {
    return !prio.getTarget || prio.getTarget()
  })
  if (!prio) return null
  return { name: prio.name, target: prio.getTarget && prio.getTarget() } as T
}
