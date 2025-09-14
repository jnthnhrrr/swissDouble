let expect = require('chai').expect
let utils = require('../../app/utils')

describe('findDuplicates', () => {
  describe('when array is empty', () => {
    it('returns an empty array', () => {
      const result = utils.findDuplicates([])
      expect(result).to.be.an('array')
      expect(result).to.have.length(0)
    })
  })

  describe('when array has no duplicates', () => {
    it('returns an empty array', () => {
      const result = utils.findDuplicates([1, 2, 3, 4, 5])
      expect(result).to.be.an('array')
      expect(result).to.have.length(0)
    })

    it('works with single element', () => {
      const result = utils.findDuplicates([42])
      expect(result).to.have.length(0)
    })
  })

  describe('when array has duplicates', () => {
    it('returns duplicate occurrences (not first occurrence)', () => {
      const result = utils.findDuplicates([1, 2, 3, 2, 4, 3, 5])
      expect(result).to.have.members([2, 3])
      expect(result).to.have.length(2)
    })

    it('returns all duplicate occurrences when element appears multiple times', () => {
      const result = utils.findDuplicates([1, 2, 2, 2, 3])
      expect(result).to.have.members([2, 2])
      expect(result).to.have.length(2)
    })

    it('preserves order of duplicate occurrences', () => {
      const result = utils.findDuplicates(['a', 'b', 'c', 'b', 'd', 'c', 'e'])
      expect(result).to.deep.equal(['b', 'c'])
    })

    it('works with string duplicates', () => {
      const result = utils.findDuplicates(['hello', 'world', 'hello', 'test'])
      expect(result).to.have.members(['hello'])
      expect(result).to.have.length(1)
    })
  })

  describe('complex scenarios', () => {
    it('handles array with many duplicates', () => {
      const result = utils.findDuplicates([1, 1, 2, 2, 2, 3, 3, 3, 3])
      expect(result).to.have.length(6)
      expect(result).to.have.members([1, 2, 2, 3, 3, 3])
    })

    it('maintains original order of duplicates', () => {
      const result = utils.findDuplicates([5, 1, 3, 1, 2, 5, 3, 2])
      expect(result).to.deep.equal([1, 5, 3, 2])
    })
  })

  describe('immutability', () => {
    it('does not modify the original array', () => {
      const original = [1, 2, 3, 2, 4]
      const originalCopy = [...original]

      utils.findDuplicates(original)

      expect(original).to.deep.equal(originalCopy)
    })
  })
})
