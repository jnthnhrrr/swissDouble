/*************************
 *        GENERAL        *
 ************************/

const setDiff = (these, those) =>
  new Set([...these].filter((element) => !those.has(element)))

const drawRandom = (set) => {
  let array = Array.from(set)
  return array[Math.floor(Math.random() * array.length)]
}

const findDuplicates = (array) =>
  array.filter((item, index) => array.indexOf(item) !== index)

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const isTruthy = (value) => {
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

const randomId = () => Math.random().toString(36).replace(/^0\./, '_')

/*************************
 *   KEY-VALUE-STORAGE   *
 ************************/

const ROOT = 'swiss-double'
const getStoreValue = () => JSON.parse(localStorage.getItem(ROOT)) || {}
const setStoreValue = (value) =>
  localStorage.setItem(ROOT, JSON.stringify(value))

const load = (key) => getStoreValue()[key]
const dump = (key, value) => {
  let storeValue = getStoreValue()
  storeValue[key] = value
  setStoreValue(storeValue)
}

const erase = (key) => {
  let store = getStoreValue()
  delete store[key]
  setStoreValue(store)
}

/*************************
 *    DOM INTERACTION    *
 ************************/

const domRead = (id) => document.getElementById(id).value
const domWrite = (id, value) => {
  document.getElementById(id).value = value
  return true
}

const domFromHTML = (html) => {
  html = html.trim()

  const template = document.createElement('template')
  template.innerHTML = html
  const result = template.content.children

  if (result.length == 1) return result[0]
  return result
}
