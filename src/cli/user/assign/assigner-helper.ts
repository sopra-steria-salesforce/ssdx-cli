export function add(
  to_add: boolean,
  values: string[] = [],
  value: string[] = []
) {
  if (to_add) {
    values.push(...value);
  }
}

export function addLabel(to_add: boolean, types: string[] = [], type: string) {
  if (to_add) {
    types.push(type);
  }
}
