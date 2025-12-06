import { expect } from 'chai'
import { STORAGE_KEYS } from '../../../dist/storage.js'

describe('freeGameStrategy storage', function () {
  it('includes freeGameStrategy in STORAGE_KEYS', function () {
    expect(STORAGE_KEYS).to.include('freeGameStrategy')
  })
})
