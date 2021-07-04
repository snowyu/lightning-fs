export function fromMap(map) {
  return Array.from
    ( map.entries()
    , ([ k, v ]) =>
        v instanceof Map
          ? { _mK: k, _mVal: fromMap (v) }
          : { _mK: k, _mVal: v }
    )
}
