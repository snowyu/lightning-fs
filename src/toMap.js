export function toMap(arr) {
  let m = new Map()
  arr.forEach(item => {
    let v = item._mVal;
    if (Array.isArray(v) && v[0] && v[0]._mK !== undefined) v = toMap(v)
    m.set(item._mK, v)
  })
  return m
}
