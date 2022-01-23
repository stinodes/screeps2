export enum Spooders {
  spiderling = 'spiderling',
  coreWeaver = 'core-weaver',
  hunter = 'hunter',
  carrier = 'carrier',
}

export type Egg = {
  type: Spooders
  data: any
}
