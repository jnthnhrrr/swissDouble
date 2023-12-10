#!/usr/bin/node

const fs = require('fs')
const { glob } = require('glob')

const concatFiles = (paths) =>
  paths.reduce((acc, path) => acc + fs.readFileSync(path, 'utf8'), '')

const run = async () => {
  let html = fs.readFileSync('app/template.html', 'utf8')

  const cssInjectionMarker = '<!--inject:css-->'
  const cssFiles = await glob('app/**/*.css', {}, (_, files) => files)
  const rawCss = concatFiles(cssFiles)
  const css = `<style>${rawCss}</style>`
  html = html.replace(cssInjectionMarker, css)

  const jsInjectionMarker = '<!--inject:js-->'
  const jsFiles = await glob('app/**/*.js', {}, (_, files) => files)
  const rawJs = concatFiles(jsFiles)
  const js = `<script>${rawJs}</script>`
  html = html.replace(jsInjectionMarker, js)

  fs.writeFileSync('swissDouble.html', html)
}

run()
