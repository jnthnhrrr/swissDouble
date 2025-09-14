export const readFromInputField = (id: string) =>
  (document.getElementById(id) as HTMLInputElement).value

export const writeToInputField = (id: string, value: string) => {
  ;(document.getElementById(id) as HTMLInputElement)!.value = value
  return true
}

type HTMLElementTagNameMap = {
  div: HTMLDivElement
  input: HTMLInputElement
  span: HTMLSpanElement
  button: HTMLButtonElement
  table: HTMLTableElement
  tr: HTMLTableRowElement
}

export function htmlElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  html: string
): HTMLElementTagNameMap[K]

export function htmlElement(tag: string, html: string): HTMLElement {
  html = html.trim()
  const template = document.createElement('template')
  template.innerHTML = html
  const result = template.content.children

  if (result.length !== 1) {
    throw new Error(`Expected exactly one element, got ${result.length}`)
  }

  const element = result[0] as HTMLElement

  if (element.tagName.toLowerCase() !== tag.toLowerCase()) {
    throw new Error(
      `Element tag mismatch: expected ${tag}, got ${element.tagName.toLowerCase()}`
    )
  }

  return element
}
