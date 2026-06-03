import { Command } from 'commander'
import { join } from 'node:path'
import { traverse } from './traverse.js'
import { Reporter } from './reporter.js'

const program = new Command()

program
  .name('stac-zod')
  .description('Validate STAC catalogs using Zod schemas')
  .version('0.1.0')

program
  .command('validate <url>')
  .description('Traverse and validate a STAC catalog')
  .option('-c, --concurrency <n>', 'max concurrent requests', '10')
  .option('-o, --output <path>', 'markdown report output path', 'stac-validation-report.md')
  .option('--fail-fast', 'stop traversal on first validation error')
  .action(async (url: string, options: { concurrency: string; output: string; failFast?: boolean }) => {
    const concurrency = parseInt(options.concurrency, 10)
    const failFast = options.failFast ?? false
    const outputPath = options.output.startsWith('/')
      ? options.output
      : join(process.cwd(), options.output)

    const reporter = new Reporter(url)
    reporter.start()

    try {
      await traverse(url, { concurrency, failFast }, (result) => reporter.onResult(result))
    } catch (err) {
      process.stderr.write(`Fatal error: ${String(err)}\n`)
      process.exit(1)
    }

    reporter.finish(outputPath)
  })

program.parseAsync(process.argv).catch((err: unknown) => {
  process.stderr.write(`Error: ${String(err)}\n`)
  process.exit(1)
})
