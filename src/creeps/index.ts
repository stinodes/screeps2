export enum Spooders {
  spiderling = 'spiderling',
  coreWeavers = 'core-weavers',
}

export type Egg = {
  type: Spooders
  data: any
}
