import { describe } from 'mocha'
import { assert, expect } from 'chai'

import WikiConfig, { contentMapFromWikiConfigOptions } from '../../src/wiki/wiki-config'
import { ContentMap } from '../../src/content-map'

describe('WikiConfig', () => {
  describe('constructor', () => {
    const minimalValidOptions = {
      inputDirectoryPath: 'a/directory/path',
      inputFilePaths: []
    }

    it('succeeds with minimally valid options', () => {
      expect(new WikiConfig(minimalValidOptions)).to.not.be.null
    })

    it('requires the inputDirectoryPath arg', () => {
      assert.throws(() => {
        const opts = {
          ...minimalValidOptions,
          inputDirectoryPath: undefined
        }
        new WikiConfig(opts)
      })
    })

    it('requires the inputFilePaths arg', () => {
      assert.throws(() => {
        const opts = {
          ...minimalValidOptions,
          inputFilePaths: undefined
        }
        new WikiConfig(opts)
      })
    })
  })
})

describe('contentMapFromWikiConfigOptions', () => {

  const inputDirectoryPath = '/input/'
  const inputFilePaths = [
    'Home.md',
    'Getting-Started.md',
    'images/big-idea.png',
  ]

  const expectedEntriesWithDefaultMetadata = [
    {
      src: 'Home.md',
      dest: '/_index.md',
      wikiTarget: 'Home',
      hugoFrontMatter: {
        title: 'Home'
      }
    },
    {
      src: 'Getting-Started.md',
      dest: '/getting-started/_index.md',
      wikiTarget: 'Getting-Started',
      hugoFrontMatter: {
        title: 'Getting Started'
      }
    },
    {
      src: 'images/big-idea.png',
      dest: '/images/big-idea.png'
    }
  ]

  describe('no custom metadata', () =>
    it('produces the expected ContentMap', () => {
      const expected = new ContentMap(expectedEntriesWithDefaultMetadata)

      const actual = contentMapFromWikiConfigOptions({inputFilePaths, inputDirectoryPath})
      expect(actual).to.deep.equal(expected)
    })
  )

  describe('with custom title in metadata', () => {
    const metadata = {
      'Getting-Started.md': {
        title: 'Getting Started With Filecoin',
        weight: 1
      }
    }

    it('uses custom title in ContentMap', () => {
      const expectedEntries = expectedEntriesWithDefaultMetadata.map(entry => {
        if (entry.src !== 'Getting-Started.md') {
          return entry
        }
        return {
          ...entry, hugoFrontMatter: {
            title: 'Getting Started With Filecoin',
            weight: 1
          }
        }
      })

      const actual = contentMapFromWikiConfigOptions({inputFilePaths, inputDirectoryPath, metadata})
      expect(actual).to.deep.equal(new ContentMap(expectedEntries))
    })
  })

  describe('without title in metadata', () => {
    const gettingStartedMetadata = {
      weight: 1
    }

    const metadata = {
      'Getting-Started.md': gettingStartedMetadata
    }

    it('merges default title with custom metadata', () => {

      const expectedEntries = expectedEntriesWithDefaultMetadata.map(entry => {
        if (entry.src !== 'Getting-Started.md') {
          return entry
        }
        const expectedFrontMatter = {weight: 1, 'title': 'Getting Started'}
        return {...entry, hugoFrontMatter: expectedFrontMatter}
      })

      const actual = contentMapFromWikiConfigOptions({inputFilePaths, inputDirectoryPath, metadata})
      expect(actual).to.deep.equal(new ContentMap(expectedEntries))
    })
  })
})