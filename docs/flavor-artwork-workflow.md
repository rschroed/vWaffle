# Flavor Artwork Workflow

Flavor artwork is tied 1:1 to `WaffleFlavor`, not to individual waffle records.

## Source Of Truth

- Code source of truth: `WAFFLE_FLAVORS` in `src/domain/waffles.ts`
- Figma source file: `AwFfD4RhxBCjE8OwR2htej`
- Figma source page: `Waffles` (`66:240`)
- Runtime asset location: `public/waffles/`

Only flavors listed in `WAFFLE_FLAVORS` are supported at runtime. The app derives artwork from `waffle.flavor`, so no API, database, or composer payload changes are needed.

## Naming Contract

Each supported flavor should have a top-level frame in the Figma `Waffles` page whose frame name exactly matches the flavor string in code.

Current supported frames:

- `Classic Buttermilk`
- `Blueberry Blitz`
- `Chocolate Confetti`
- `Matcha Mingle`
- `Savory Cheddar`

Extra exploratory frames in Figma are allowed, but they are ignored until the flavor is added to `WAFFLE_FLAVORS`.

## Export Convention

Export each supported frame from Figma as a PNG at 2x and save it into `public/waffles/` using the normalized filename generated from the flavor string.

Normalization rules:

1. Trim leading and trailing whitespace.
2. Lowercase the flavor name.
3. Replace each run of non-alphanumeric characters with `-`.
4. Collapse repeated `-`.
5. Remove leading and trailing `-`.

Examples:

- `Classic Buttermilk` -> `public/waffles/classic-buttermilk.png`
- `Blueberry Blitz` -> `public/waffles/blueberry-blitz.png`
- `Chocolate Confetti` -> `public/waffles/chocolate-confetti.png`
- `Matcha Mingle` -> `public/waffles/matcha-mingle.png`
- `Savory Cheddar` -> `public/waffles/savory-cheddar.png`

The app uses the same normalization in `src/features/home/waffleFlavorArtwork.ts`.

## Repeatable Update Flow

1. Add or update the flavor artwork frame in the Figma `Waffles` page.
2. Make sure the frame name exactly matches the flavor string in `WAFFLE_FLAVORS`.
3. Export the frame as a 2x PNG.
4. Save the file to `public/waffles/<normalized-flavor>.png`.
5. If this is a new flavor, add it to `WAFFLE_FLAVORS` first, then add the Figma frame, then commit the exported asset.
6. Run `npm run test:run` to verify every supported flavor resolves to a committed local artwork file.

## Runtime Behavior

- The composer still only asks the user to choose a flavor and write the message.
- The feed derives the image from `waffle.flavor`.
- Production uses committed app-owned assets under `/waffles/*.png`.
- The runtime app does not fetch artwork from Figma.
