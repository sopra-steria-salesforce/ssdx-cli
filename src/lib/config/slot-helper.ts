export function add(
  to_add: boolean,
  values: string[] = [],
  value: string[] = []
) {
  if (to_add) {
    values.push(...value);
  }
}
