import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { WAFFLE_FLAVORS } from '../../domain/waffles'
import {
  getWaffleFlavorArtwork,
  slugifyWaffleFlavor,
} from './waffleFlavorArtwork'

describe('waffleFlavorArtwork', () => {
  it('slugifies supported flavors deterministically', () => {
    expect(slugifyWaffleFlavor('Classic Buttermilk')).toBe('classic-buttermilk')
    expect(slugifyWaffleFlavor('Blueberry Blitz')).toBe('blueberry-blitz')
    expect(slugifyWaffleFlavor('Chocolate Confetti')).toBe('chocolate-confetti')
    expect(slugifyWaffleFlavor('Matcha Mingle')).toBe('matcha-mingle')
    expect(slugifyWaffleFlavor('Savory Cheddar')).toBe('savory-cheddar')
  })

  it('maps every supported flavor to a committed artwork file', () => {
    for (const flavor of WAFFLE_FLAVORS) {
      const artwork = getWaffleFlavorArtwork(flavor)
      const filename = artwork.src.replace('/waffles/', '')
      const assetPath = join(process.cwd(), 'public', 'waffles', filename)

      expect(artwork.alt).toBe(`${flavor} waffle artwork`)
      expect(artwork.src).toBe(`/waffles/${slugifyWaffleFlavor(flavor)}.png`)
      expect(existsSync(assetPath)).toBe(true)
    }
  })
})
