/*************************
 *        GENERAL        *
 ************************/

export const setDiff = (these: string[], those: string[]) =>
  new Set([...these].filter((element) => !those.includes(element)))

export const drawRandom = (set: Set<any>) => {
  let array = Array.from(set)
  return array[Math.floor(Math.random() * array.length)]
}

export const findDuplicates = (array: string[]) =>
  array.filter((item, index) => array.indexOf(item) !== index)

export const isTruthy = (value: any) => {
  // a more pythonic implementation of truthyness, regarding empty collections
  // as falsy
  try {
    return !!value.length
  } catch {}
  try {
    return !!Object.keys(value).length
  } catch {}
  try {
    return !!value.size
  } catch {}
  return !!value
}

export const randomId = () => Math.random().toString(36).replace(/^0\./, '_')

export const groupBy = <T>(array: T[], comparator: Function) => {
  // requires array to be pre-sorted by projection function
  if (!isTruthy(array)) return []
  const groups: T[][] = []
  let currentGroup = [array[0]]

  for (const element of array.slice(1)) {
    if (comparator(currentGroup[0], element)) {
      currentGroup.push(element)
    } else {
      groups.push(currentGroup)
      currentGroup = [element]
    }
  }
  groups.push(currentGroup)
  return groups
}

export const popRandom = (list: string[]) =>
  list.splice(Math.floor(Math.random() * list.length), 1)[0]
