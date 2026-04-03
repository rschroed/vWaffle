import { WAFFLE_FLAVORS, type WaffleFlavor } from '../../domain/waffles'

export type WaffleFlavorArtwork = {
  alt: string
  src: string
}

export const slugifyWaffleFlavor = (flavor: WaffleFlavor) =>
  flavor
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const WAFFLE_FLAVOR_ARTWORK: Record<WaffleFlavor, WaffleFlavorArtwork> =
  Object.fromEntries(
    WAFFLE_FLAVORS.map((flavor) => [
      flavor,
      {
        alt: `${flavor} waffle artwork`,
        src: `/waffles/${slugifyWaffleFlavor(flavor)}.png`,
      },
    ])
  ) as Record<WaffleFlavor, WaffleFlavorArtwork>

export const getWaffleFlavorArtwork = (
  flavor: WaffleFlavor
): WaffleFlavorArtwork => WAFFLE_FLAVOR_ARTWORK[flavor]
