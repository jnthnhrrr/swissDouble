let expect = require('chai').expect
let utils = require('../app/utils')

describe('popRandom', () => {
  describe('when array is empty', () => {
    it('returns undefined', () => {
      expect(utils.popRandom([])).to.be.undefined
    })
  })

  describe('when array is no empty', () => {
    it('removes the chosen element from the array', () => {
      const list = [1, 2, 3, 4]
      const pick = utils.popRandom(list)
      expect(list).to.not.include(pick)
    })

      it('returns an element that was originally in the array', () => {
      const originalList = [1, 2, 3, 4]
      const list = [...originalList]
      const pick = utils.popRandom(list)
      expect(originalList).to.include(pick)
    })

    it('reduces array length by 1', () => {
      const list = [1, 2, 3, 4]
      const originalLength = list.length
      utils.popRandom(list)
      expect(list.length).to.equal(originalLength - 1)
    })

    it('returns a single element (not an array)', () => {
      const list = ['a', 'b', 'c', 'd']
      const pick = utils.popRandom(list)
      expect(pick).to.not.be.an('array')
      expect(pick).to.be.a('string')
    })

    it('works with single element array', () => {
      const list = [42]
      const pick = utils.popRandom(list)
      expect(pick).to.equal(42)
      expect(list).to.have.length(0)
    })
  })
})
