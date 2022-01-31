export type Body = {
  parts: {
    [name in BodyPartConstant]?: number
  }
  grow?: boolean
}

const sumPrice = (parts: BodyPartConstant[]) =>
  parts.reduce((v, p) => v + BODYPART_COST[p], 0)

export const createBody = (b: Body, energy: number = 300) => {
  const partsArray = (Object.keys(b.parts) as BodyPartConstant[]).reduce(
    (prev, p) => {
      const parts = new Array(b.parts[p]).fill(p)
      return prev.concat(parts)
    },
    [] as BodyPartConstant[],
  )
  if (!b.grow) return partsArray

  const partsPrice = sumPrice(partsArray)
  const factor = energy / partsPrice
  const ceilFactor = Math.ceil(factor)

  const scaledBody = _.flatten(new Array(ceilFactor).fill(partsArray)).reduce(
    (prev, part) => {
      const newArr = [...prev, part]
      if (sumPrice(newArr) <= energy) return newArr
      return prev
    },
    [],
  )

  return scaledBody
}
