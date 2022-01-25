import { Body } from './body'

export enum Spooders {
  spiderling = 'spiderling',
  coreWeaver = 'core-weaver',
  hunter = 'hunter',
  carrier = 'carrier',
  worker = 'worker',
}

export type Egg = {
  type: Spooders
  body: Body
  data: any
}

export type LayEgg<Data extends void | {}> = (data: Data) => Egg
