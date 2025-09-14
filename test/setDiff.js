let expect = require('chai').expect
let utils = require('../app/utils')

describe('setDiff', () => {
  describe('when both sets are empty', () => {
    it('returns an empty set', () => {
      const result = utils.setDiff(new Set(), new Set())
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(0)
    })
  })

  describe('when first set is empty', () => {
    it('returns an empty set', () => {
      const those = new Set([1, 2, 3])
      const result = utils.setDiff(new Set(), those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(0)
    })
  })

  describe('when second set is empty', () => {
    it('returns a copy of the first set', () => {
      const these = new Set([1, 2, 3])
      const result = utils.setDiff(these, new Set())
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(3)
      expect([...result]).to.have.members([1, 2, 3])
    })
  })

  describe('when sets have no common elements', () => {
    it('returns a copy of the first set', () => {
      const these = new Set([1, 2, 3])
      const those = new Set([4, 5, 6])
      const result = utils.setDiff(these, those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(3)
      expect([...result]).to.have.members([1, 2, 3])
    })
  })

  describe('when sets have some common elements', () => {
    it('returns elements only in the first set', () => {
      const these = new Set([1, 2, 3, 4])
      const those = new Set([3, 4, 5, 6])
      const result = utils.setDiff(these, those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(2)
      expect([...result]).to.have.members([1, 2])
    })
  })

  describe('when second set contains all elements of first set', () => {
    it('returns an empty set', () => {
      const these = new Set([1, 2, 3])
      const those = new Set([1, 2, 3, 4, 5])
      const result = utils.setDiff(these, those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(0)
    })
  })

  describe('when sets are identical', () => {
    it('returns an empty set', () => {
      const these = new Set([1, 2, 3])
      const those = new Set([1, 2, 3])
      const result = utils.setDiff(these, those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(0)
    })
  })

  describe('with different data types', () => {
    it('works with strings', () => {
      const these = new Set(['a', 'b', 'c'])
      const those = new Set(['b', 'c', 'd'])
      const result = utils.setDiff(these, those)
      expect([...result]).to.have.members(['a'])
    })

    it('works with mixed types', () => {
      const these = new Set([1, 'a', true, null])
      const those = new Set(['a', false, null])
      const result = utils.setDiff(these, those)
      expect([...result]).to.have.members([1, true])
    })
  })

  describe('immutability', () => {
    it('does not modify the original sets', () => {
      const these = new Set([1, 2, 3])
      const those = new Set([2, 3, 4])
      const originalTheseSize = these.size
      const originalThoseSize = those.size

      utils.setDiff(these, those)

      expect(these.size).to.equal(originalTheseSize)
      expect(those.size).to.equal(originalThoseSize)
      expect(these.has(1) && these.has(2) && these.has(3)).to.be.true
      expect(those.has(2) && those.has(3) && those.has(4)).to.be.true
    })

    it('returns a new Set instance', () => {
      const these = new Set([1, 2, 3])
      const those = new Set([4, 5, 6])
      const result = utils.setDiff(these, those)
      expect(result).to.not.equal(these)
    })
  })

  describe('element order preservation', () => {
    it('preserves the original order of elements from the first set', () => {
      // Note: Set iteration order is insertion order in JavaScript
      const these = new Set([5, 1, 3, 2, 4])
      const those = new Set([2, 4])
      const result = utils.setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = [5, 1, 3] // original order minus removed elements

      expect(resultArray).to.deep.equal(expectedOrder)
    })

    it('maintains order with string elements', () => {
      const these = new Set(['zebra', 'apple', 'cat', 'dog', 'banana'])
      const those = new Set(['cat', 'banana'])
      const result = utils.setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = ['zebra', 'apple', 'dog']

      expect(resultArray).to.deep.equal(expectedOrder)
    })

    it('preserves order when no elements are removed', () => {
      const these = new Set(['first', 'second', 'third', 'fourth'])
      const those = new Set(['not', 'present'])
      const result = utils.setDiff(these, those)

      const resultArray = [...result]
      const originalOrder = ['first', 'second', 'third', 'fourth']

      expect(resultArray).to.deep.equal(originalOrder)
    })

    it('maintains order when removing first element', () => {
      const these = new Set(['remove-me', 'keep1', 'keep2', 'keep3'])
      const those = new Set(['remove-me'])
      const result = utils.setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = ['keep1', 'keep2', 'keep3']

      expect(resultArray).to.deep.equal(expectedOrder)
    })

    it('maintains order when removing last element', () => {
      const these = new Set(['keep1', 'keep2', 'keep3', 'remove-me'])
      const those = new Set(['remove-me'])
      const result = utils.setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = ['keep1', 'keep2', 'keep3']

      expect(resultArray).to.deep.equal(expectedOrder)
    })

    it('maintains order when removing middle elements', () => {
      const these = new Set(['keep1', 'remove1', 'keep2', 'remove2', 'keep3'])
      const those = new Set(['remove1', 'remove2'])
      const result = utils.setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = ['keep1', 'keep2', 'keep3']

      expect(resultArray).to.deep.equal(expectedOrder)
    })
  })
})
