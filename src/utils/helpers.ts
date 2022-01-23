const delimiter = ';'

export type SerializedPosition = string

export const serializePos = (pos: RoomPosition) => {
  return [pos.x, pos.y, pos.roomName].join(delimiter)
}

export const deserializePos = (posStr: SerializedPosition) => {
  const [x, y, room] = posStr.split(delimiter)
  return new RoomPosition(parseInt(x), parseInt(y), room)
}
