#!/usr/bin/node

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

const concatFiles = (paths) =>
  paths.reduce((acc, path) => acc + readFileSync(path, 'utf8'), '')

const run = async () => {
  let html = readFileSync('app/template.html', 'utf8')

  // Handle CSS
  const cssInjectionMarker = '<!--inject:css-->'
  const cssFiles = await glob('app/**/*.css')
  const rawCss = concatFiles(cssFiles)
  const css = `<style>${rawCss}</style>`
  html = html.replace(cssInjectionMarker, css)

  // Handle JavaScript from dist directory
  const jsInjectionMarker = '<!--inject:js-->'
  const jsFiles = await glob('dist/bundle.js')

  if (jsFiles.length === 0) {
    console.error('No JavaScript files found in dist/. Did you run transpilation first?')
    process.exit(1)
  }

  const rawJs = concatFiles(jsFiles)
  const js = `<script>${rawJs}</script>`
  html = html.replace(jsInjectionMarker, js)

  writeFileSync('swissDouble.html', html)
}

run()
