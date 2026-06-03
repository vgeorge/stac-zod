import chalk from 'chalk'
import ora, { type Ora } from 'ora'
import { writeFileSync } from 'node:fs'
import type { ValidationResult, StacObjectType } from './traverse.js'

const TYPE_PAD = 10

function formatType(type: StacObjectType): string {
  return `[${type.toLowerCase()}]`.padEnd(TYPE_PAD)
}

function formatUrl(url: string): string {
  const max = 80
  return url.length > max ? '...' + url.slice(-(max - 3)) : url
}

export class Reporter {
  private spinner: Ora
  private results: ValidationResult[] = []
  private rootUrl: string
  private count = 0

  constructor(rootUrl: string) {
    this.rootUrl = rootUrl
    this.spinner = ora({
      text: `Validating ${rootUrl}`,
      discardStdin: false,
    })
  }

  start(): void {
    process.stdout.write(`\nValidating ${this.rootUrl}\n\n`)
    this.spinner.start()
  }

  onResult(result: ValidationResult): void {
    this.results.push(result)
    this.count++
    this.spinner.clear()

    const typeLabel = formatType(result.type)
    const urlLabel = formatUrl(result.url)

    if (result.valid) {
      process.stdout.write(`  ${typeLabel} ${urlLabel}  ${chalk.green('✓')}\n`)
    } else {
      process.stdout.write(`  ${typeLabel} ${urlLabel}  ${chalk.red('✗')}\n`)
      for (const err of result.errors) {
        process.stdout.write(chalk.red(`    · ${err}\n`))
      }
    }

    this.spinner.text = `Validating... (${this.count} done)`
    this.spinner.render()
  }

  finish(outputPath: string): void {
    this.spinner.stop()

    const total = this.results.length
    const failed = this.results.filter((r) => !r.valid).length
    const passed = total - failed

    process.stdout.write('\n')
    if (failed === 0) {
      process.stdout.write(chalk.green(`Results: ${total} objects — all passed\n`))
    } else {
      process.stdout.write(
        chalk.red(`Results: ${total} objects — ${passed} passed, ${failed} failed\n`),
      )
    }

    this.writeMarkdown(outputPath)
    process.stdout.write(`Report saved to ${outputPath}\n`)
  }

  private writeMarkdown(outputPath: string): void {
    const total = this.results.length
    const failed = this.results.filter((r) => !r.valid).length
    const date = new Date().toISOString().slice(0, 10)
    const status =
      failed === 0
        ? 'PASSED'
        : `FAILED — ${failed} error${failed !== 1 ? 's' : ''} in ${total} objects`

    const byType: Record<string, ValidationResult[]> = {
      Catalog: [],
      Collection: [],
      Item: [],
    }
    for (const r of this.results) {
      if (r.type in byType) {
        byType[r.type].push(r)
      }
    }

    const lines: string[] = [
      '# STAC Validation Report',
      '',
      `**URL:** ${this.rootUrl}`,
      `**Date:** ${date}`,
      `**Status:** ${status}`,
      '',
      '## Summary',
      '',
      '| Type | Total | Valid | Errors |',
      '|------|-------|-------|--------|',
    ]

    for (const [type, items] of Object.entries(byType)) {
      if (items.length === 0) continue
      const typeValid = items.filter((r) => r.valid).length
      const typeErrors = items.length - typeValid
      lines.push(`| ${type}s | ${items.length} | ${typeValid} | ${typeErrors} |`)
    }

    const errorResults = this.results.filter((r) => !r.valid)
    if (errorResults.length > 0) {
      lines.push('', '## Errors', '')
      for (const r of errorResults) {
        lines.push(`### ${r.url}`, '')
        for (const err of r.errors) {
          lines.push(`- \`${err}\``)
        }
        lines.push('')
      }
    }

    writeFileSync(outputPath, lines.join('\n'), 'utf-8')
  }
}
