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

export type TaskPhase<S extends CreepMemory, P extends string> = {
  name: P
  when: (s: S) => boolean
}

export const creepPhase = <P extends string, S extends CreepMemory>(
  spider: S,
  phases: TaskPhase<S, P>[],
): P | null => {
  if (!spider.data) spider.data = {}

  const newPhaseName = phases.reduce((prev, phase) => {
    if (phase.when(spider)) return phase.name
    return prev
  }, spider.data?.phase)

  spider.data.phase = newPhaseName || phases[0].name

  return spider.data.phase
}
