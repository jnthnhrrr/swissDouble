import { htmlElement } from '../dom.js'

export const createFooter = () => {
  const dom = htmlElement(
    'footer',
    `
    <footer id="footer">
      Version <strong>1.0.0</strong>
      <br>Dieses Programm ist Open Source und kann kostenlos verwendet werden.
      <br><a href="https://github.com/jnthnhrrr/swissDouble/" target="_blank" rel="noopener noreferrer">Quellcode</a> | <a href="https://github.com/jnthnhrrr/swissDouble/blob/master/SPEZIFIKATIONEN.md" target="_blank" rel="noopener noreferrer">Spezifikationen</a> | <a href="https://github.com/jnthnhrrr/swissDouble/blob/master/LICENSE.md" target="_blank" rel="noopener noreferrer">Lizenz</a>
    </footer>
  `
  )
  const existingFooter = document.getElementById('footer')
  if (existingFooter) {
    existingFooter.replaceWith(dom)
  } else {
    document.getElementById('universe')!.appendChild(dom)
  }
}
