import { expect } from 'chai'
import { groupBy } from '../../dist/utils.js'

describe('groupBy', () => {
  describe('when array is empty', () => {
    it('returns an empty array', () => {
      expect(groupBy([])).to.be.deep.equal([])
    })
  })

  describe('when array has different groups under projection function', () => {
    const array = [
      [1, 2, 2],
      [2, 2, 2],
      [3, 2, 2],
      [1, 1, 2],
      [1, 2, 1],
      [2, 2, 1],
    ]
    const comparator = (thisTriple, thatTriple) =>
      thisTriple[1] == thatTriple[1] && thisTriple[2] == thatTriple[2]
    const result = groupBy(array, comparator)
    expect(result).to.be.deep.equal([
      [
        [1, 2, 2],
        [2, 2, 2],
        [3, 2, 2],
      ],
      [[1, 1, 2]],
      [
        [1, 2, 1],
        [2, 2, 1],
      ],
    ])
  })
})
