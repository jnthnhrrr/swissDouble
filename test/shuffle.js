let expect = require('chai').expect
let utils = require('../app/utils')

describe('shuffle', () => {
  describe('when array is empty', () => {
    it('returns the same empty array', () => {
      const array = []
      const result = utils.shuffle(array)
      expect(result).to.equal(array) // Same reference
      expect(result).to.have.length(0)
    })
  })

  describe('when array has one element', () => {
    it('returns the same array unchanged', () => {
      const array = [42]
      const result = utils.shuffle(array)
      expect(result).to.equal(array)
      expect(result).to.deep.equal([42])
    })
  })

  describe('when array has multiple elements', () => {
    it('returns the same array reference (mutates original)', () => {
      const array = [1, 2, 3, 4, 5]
      const result = utils.shuffle(array)
      expect(result).to.equal(array)
    })

    it('contains all original elements', () => {
      const original = [1, 2, 3, 4, 5]
      const array = [...original]
      const result = utils.shuffle(array)
      expect(result).to.have.members(original)
      expect(result).to.have.length(original.length)
    })

    it('works with string elements', () => {
      const original = ['apple', 'banana', 'cherry', 'date']
      const array = [...original]
      const result = utils.shuffle(array)
      expect(result).to.have.members(original)
      expect(result).to.have.length(4)
    })
  })

  describe('randomness', () => {
    it('eventually produces different arrangements', () => {
      const original = [1, 2, 3, 4, 5]
      const arrangements = new Set()

      // Generate multiple shuffles
      for (let i = 0; i < 10000; i++) {
        const array = [...original]
        utils.shuffle(array)
        arrangements.add(JSON.stringify(array))
      }

      expect(arrangements.size).to.be.at.least(120)
    })

    it('can place any element in any position', () => {
      const original = [1, 2, 3]
      const firstPositions = new Set()

      for (let i = 0; i < 50; i++) {
        const array = [...original]
        utils.shuffle(array)
        firstPositions.add(array[0])
      }

      expect(firstPositions.size).to.equal(3)
      expect([...firstPositions]).to.have.members([1, 2, 3])
    })
  })

  describe('mutation behavior', () => {
    it('modifies the original array', () => {
      const array = [1, 2, 3, 4, 5]
      const originalReference = array

      utils.shuffle(array)

      expect(array).to.equal(originalReference)
    })

    it('maintains array length', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const originalLength = array.length

      utils.shuffle(array)

      expect(array.length).to.equal(originalLength)
    })
  })

  describe('edge cases', () => {
    it('handles array with duplicate elements', () => {
      const original = [1, 1, 2, 2, 3]
      const array = [...original]
      const result = utils.shuffle(array)

      expect(result).to.have.length(5)
      const counts = {}
      result.forEach(item => counts[item] = (counts[item] || 0) + 1)
      expect(counts[1]).to.equal(2)
      expect(counts[2]).to.equal(2)
      expect(counts[3]).to.equal(1)
    })

    it('handles array with two elements', () => {
      const original = ['a', 'b']
      const arrangements = new Set()

      for (let i = 0; i < 20; i++) {
        const array = [...original]
        utils.shuffle(array)
        arrangements.add(JSON.stringify(array))
      }

      expect(arrangements.size).to.equal(2)
    })
  })
})
