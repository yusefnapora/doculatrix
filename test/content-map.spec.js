import { describe } from 'mocha'
import { assert, expect } from 'chai'

import { ContentMap } from '../src/content-map'

describe('ContentMap', () => {
  describe('constructor', () => {
    it('fails if any entries are missing "src" field', () => {
      assert.throws(() => {
        new ContentMap([{}])
      })

      assert.throws(() => {
        new ContentMap([{src: 'foo'}, {dest: 'no src, will throw'}])
      })
    })

    it('succeeds if given input with unknown fields', () =>
      expect(() => new ContentMap([{src: 'foo', unknownFieldXYZ: 'yep'}]))
        .to.not.be.null
    )
  })

  describe('getOutputPath', () => {
    let sut = null

    beforeEach(() =>
      sut = new ContentMap([{src: 'no-dest.md'}, {src: 'with-dest.md', dest: 'new-dest.md'}]))

    describe('with outputRoot argument', () => {
      describe('entry has "dest" field', () =>
        it('returns dest from entry, relative to outputRoot', () =>
          expect(sut.getOutputPath('with-dest.md', '/content'))
            .to.equal('/content/new-dest.md')))

      describe('entry has no "dest" field', () =>
        it('returns "src" from entry, relative to outputRoot', () =>
          expect(sut.getOutputPath('no-dest.md', '/content'))
            .to.equal('/content/no-dest.md')))
    })

    describe('no outputRoot argument', () => {
      describe('entry has "dest" field', () =>
        it('returns dest from entry', () =>
          expect(sut.getOutputPath('with-dest.md'))
            .to.equal('new-dest.md')))

      describe('entry has no "dest" field', () =>
        it('returns "src" from entry', () =>
          expect(sut.getOutputPath('no-dest.md'))
            .to.equal('no-dest.md')))
    })
  })
})