import { expect } from 'chai'
import { drawRandom } from '../../dist/utils.js'

describe('drawRandom', () => {
  describe('when set is empty', () => {
    it('returns undefined', () => {
      const result = drawRandom(new Set())
      expect(result).to.be.undefined
    })
  })

  describe('when set has one element', () => {
    it('returns that element', () => {
      const set = new Set([42])
      const result = drawRandom(set)
      expect(result).to.equal(42)
    })

    it('works with string data types', () => {
      const stringSet = new Set(['hello'])
      expect(drawRandom(stringSet)).to.equal('hello')
    })
  })

  describe('when set has multiple elements', () => {
    it('returns an element that exists in the set', () => {
      const set = new Set([1, 2, 3, 4, 5])
      const result = drawRandom(set)
      expect(set.has(result)).to.be.true
    })

    it('returns a single element (not an array)', () => {
      const set = new Set(['a', 'b', 'c'])
      const result = drawRandom(set)
      expect(result).to.not.be.an('array')
      expect(result).to.be.a('string')
    })

    it('can return any element from the set', () => {
      // This test is not deterministic. Its probability to fail is about 10^-96
      const set = new Set([1, 2, 3, 4, 5])
      const results = new Set()

      for (let i = 0; i < 1000; i++) {
        results.add(drawRandom(set))
      }

      expect(results.size).to.be.at.least(5)
    })

    it('works with mixed data types', () => {
      const set = new Set([1, 'hello', true, null, { key: 'value' }])
      const result = drawRandom(set)
      expect(set.has(result)).to.be.true
    })
  })

  describe('immutability', () => {
    it('does not modify the original set', () => {
      const set = new Set([1, 2, 3, 4, 5])
      const originalSize = set.size
      const originalElements = [...set]

      drawRandom(set)

      expect(set.size).to.equal(originalSize)
      expect([...set]).to.have.members(originalElements)
    })
  })
})
