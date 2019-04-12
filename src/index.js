require('@babel/polyfill')

const { processSite } = require('./reformat')
const { SiteConfig } = require('./site-config')

const argv = require('yargs')
  .describe('inputPath', 'path to local directory containing docs')
  .alias('i', 'inputPath')

  .describe('outputPath', 'path to local directory where you want to output formatted docs')
  .alias('o', 'outputPath')
  .default('outputPath', './content/')

  .describe('config', 'path to config file for site metadata')
  .alias('c', 'config')
  .default('config', 'doculatrix.yaml')

  .boolean('wiki', 'if set, treat the input path as a github wiki and derive as much config as possible')
  .alias('w', 'wiki')
  .default(false)

  .demand(['inputPath'])
  .argv



async function main() {
  const config = await SiteConfig.fromCommandLineArgs(argv)
  await processSite(config)
  console.log('all done')
}

main()
 .catch(console.error)
