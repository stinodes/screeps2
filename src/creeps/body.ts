export type Body = {
  parts: {
    [name in BodyPartConstant]?: number
  }
  grow?: boolean
}

export const createBody = (b: Body, energy: number = 300) => {
  const partsArray = (Object.keys(b.parts) as BodyPartConstant[]).reduce(
    (prev, p) => {
      const parts = new Array(b.parts[p]).fill(p)
      return prev.concat(parts)
    },
    [] as BodyPartConstant[],
  )
  if (!b.grow) return partsArray

  const partsPrice = partsArray.reduce((v, p) => v + BODYPART_COST[p], 0)
  const factor = Math.floor(energy / partsPrice)
  return _.flatten(new Array(factor).fill(partsArray))
}
