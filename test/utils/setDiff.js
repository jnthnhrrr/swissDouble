import { expect } from 'chai'
import { setDiff } from '../../dist/utils.js'

describe('setDiff', () => {
  describe('when both arrays are empty', () => {
    it('returns an empty set', () => {
      const result = setDiff([], [])
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(0)
    })
  })

  describe('when first array is empty', () => {
    it('returns an empty set', () => {
      const those = [1, 2, 3]
      const result = setDiff([], those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(0)
    })
  })

  describe('when second set is empty', () => {
    it('returns a copy of the first set', () => {
      const these = [1, 2, 3]
      const result = setDiff(these, [])
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(3)
      expect([...result]).to.have.members([1, 2, 3])
    })
  })

  describe('when sets have no common elements', () => {
    it('returns a copy of the first set', () => {
      const these = [1, 2, 3]
      const those = [4, 5, 6]
      const result = setDiff(these, those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(3)
      expect([...result]).to.have.members([1, 2, 3])
    })
  })

  describe('when sets have some common elements', () => {
    it('returns elements only in the first set', () => {
      const these = [1, 2, 3, 4]
      const those = [3, 4, 5, 6]
      const result = setDiff(these, those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(2)
      expect([...result]).to.have.members([1, 2])
    })
  })

  describe('when second set contains all elements of first set', () => {
    it('returns an empty set', () => {
      const these = [1, 2, 3]
      const those = [1, 2, 3, 4, 5]
      const result = setDiff(these, those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(0)
    })
  })

  describe('when sets are identical', () => {
    it('returns an empty set', () => {
      const these = [1, 2, 3]
      const those = [1, 2, 3]
      const result = setDiff(these, those)
      expect(result).to.be.an.instanceof(Set)
      expect(result.size).to.equal(0)
    })
  })

  describe('with different data types', () => {
    it('works with strings', () => {
      const these = ['a', 'b', 'c']
      const those = ['b', 'c', 'd']
      const result = setDiff(these, those)
      expect([...result]).to.have.members(['a'])
    })

    it('works with mixed types', () => {
      const these = [1, 'a', true, null]
      const those = ['a', false, null]
      const result = setDiff(these, those)
      expect([...result]).to.have.members([1, true])
    })
  })

  describe('immutability', () => {
    it('does not modify the original sets', () => {
      const these = [1, 2, 3]
      const those = [2, 3, 4]
      const originalTheseSize = these.size
      const originalThoseSize = those.size

      setDiff(these, those)

      expect(these.size).to.equal(originalTheseSize)
      expect(those.size).to.equal(originalThoseSize)
      expect(these.includes(1) && these.includes(2) && these.includes(3)).to.be.true
      expect(those.includes(2) && those.includes(3) && those.includes(4)).to.be.true
    })

    it('returns a new Set instance', () => {
      const these = [1, 2, 3]
      const those = [4, 5, 6]
      const result = setDiff(these, those)
      expect(result).to.not.equal(these)
    })
  })

  describe('element order preservation', () => {
    it('preserves the original order of elements from the first set', () => {
      // Note: Set iteration order is insertion order in JavaScript
      const these = [5, 1, 3, 2, 4]
      const those = [2, 4]
      const result = setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = [5, 1, 3] // original order minus removed elements

      expect(resultArray).to.deep.equal(expectedOrder)
    })

    it('maintains order with string elements', () => {
      const these = ['zebra', 'apple', 'cat', 'dog', 'banana']
      const those = ['cat', 'banana']
      const result = setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = ['zebra', 'apple', 'dog']

      expect(resultArray).to.deep.equal(expectedOrder)
    })

    it('preserves order when no elements are removed', () => {
      const these = ['first', 'second', 'third', 'fourth']
      const those = ['not', 'present']
      const result = setDiff(these, those)

      const resultArray = [...result]
      const originalOrder = ['first', 'second', 'third', 'fourth']

      expect(resultArray).to.deep.equal(originalOrder)
    })

    it('maintains order when removing first element', () => {
      const these = ['remove-me', 'keep1', 'keep2', 'keep3']
      const those = ['remove-me']
      const result = setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = ['keep1', 'keep2', 'keep3']

      expect(resultArray).to.deep.equal(expectedOrder)
    })

    it('maintains order when removing last element', () => {
      const these = ['keep1', 'keep2', 'keep3', 'remove-me']
      const those = ['remove-me']
      const result = setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = ['keep1', 'keep2', 'keep3']

      expect(resultArray).to.deep.equal(expectedOrder)
    })

    it('maintains order when removing middle elements', () => {
      const these = ['keep1', 'remove1', 'keep2', 'remove2', 'keep3']
      const those = ['remove1', 'remove2']
      const result = setDiff(these, those)

      const resultArray = [...result]
      const expectedOrder = ['keep1', 'keep2', 'keep3']

      expect(resultArray).to.deep.equal(expectedOrder)
    })
  })
})
