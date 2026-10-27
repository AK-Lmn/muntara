import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = process.cwd()
const tokenDir = resolve(root, 'tokens')
const outputPath = resolve(root, 'src/styles/theme.css')

function readTokenFile(name) {
  return JSON.parse(readFileSync(resolve(tokenDir, name), 'utf8'))
}

function flatten(node, prefix = '', result = []) {
  if (!node || typeof node !== 'object') return result
  if ('$value' in node) result.push([prefix, node.$value, node.$type])
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith('$') && value && typeof value === 'object') {
      flatten(value, prefix ? `${prefix}.${key}` : key, result)
    }
  }
  return result
}

const colors = readTokenFile('colors.json')
const typography = readTokenFile('typography.json')
const spacing = readTokenFile('spacing.json')
const borders = readTokenFile('borders.json')
const motion = readTokenFile('motion.json')
const theme = []

for (const section of ['semantic', 'component']) {
  for (const [name, value] of flatten(colors[section], section)) {
    theme.push(`  --color-${name.slice(section.length + 1).replaceAll('.', '-')}: ${value};`)
  }
}
for (const [name, value] of flatten(typography.fontFamily, 'fontFamily')) {
  theme.push(`  --font-${name.slice('fontFamily.'.length).replaceAll('.', '-')}: ${Array.isArray(value) ? value.join(', ') : value};`)
}
for (const [name, value] of flatten(typography.fontSize, 'fontSize')) {
  theme.push(`  --text-${name.slice('fontSize.'.length).replaceAll('.', '-')}: ${value};`)
}
for (const [name, value] of flatten(typography.lineHeight, 'lineHeight')) {
  theme.push(`  --leading-${name.slice('lineHeight.'.length).replaceAll('.', '-')}: ${value};`)
}
for (const [name, value] of flatten(spacing.scale, 'scale')) {
  theme.push(`  --spacing-${name.slice('scale.'.length)}: ${value};`)
}
for (const [name, value] of flatten(borders.radius, 'radius')) {
  theme.push(`  --radius-${name.slice('radius.'.length).replaceAll('.', '-')}: ${value};`)
}
for (const [name, value] of flatten(borders.width, 'width')) {
  theme.push(`  --width-${name.slice('width.'.length).replaceAll('.', '-')}: ${value};`)
}
for (const [name, value] of flatten(motion.duration, 'duration')) {
  theme.push(`  --duration-${name.slice('duration.'.length).replaceAll('.', '-')}: ${value};`)
}
for (const [name, value] of flatten(motion.easing, 'easing')) {
  const curve = Array.isArray(value) ? `cubic-bezier(${value.join(', ')})` : value
  theme.push(`  --ease-${name.slice('easing.'.length).replaceAll('.', '-')}: ${curve};`)
}

const dark = flatten(colors.dark)
  .map(([name, value]) => `  --color-${name.replaceAll('.', '-')}: ${value};`)
  .join('\n')
const css = `/* Generated from tokens/*.json by scripts/build_design_tokens.mjs. Do not edit. */
@theme {
${theme.join('\n')}
}

:root[data-theme='dark'] {
${dark}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${dark}
  }
}
`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, css)
console.log(`Generated ${theme.length} theme tokens at ${outputPath}`)
