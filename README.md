# PoGo Inventory Manager

A mobile-first web app that helps you decide whether to **Keep / Maybe / Transfer** a Pokémon in Pokémon GO. Upload an appraisal screenshot, let OCR auto-fill the form, correct anything that's wrong, and get a score with reasons and recommended actions. English / Korean UI built in.

All image processing happens **in your browser** — screenshots never leave your device, and there is no backend.

## Folder structure

```
pogo-inventory-manager/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx                  # entry point
    ├── App.tsx                   # page layout + state wiring
    ├── index.css                 # Tailwind directives
    ├── i18n.ts                   # English/Korean dictionary + translate()
    ├── types.ts                  # shared TypeScript types
    ├── data/
    │   └── presets.ts            # 6 example Pokémon
    ├── logic/
    │   └── scoring.ts            # all decision logic (weights, floors, thresholds)
    ├── ocr/
    │   ├── ocr.ts                # Tesseract.js OCR + parsing heuristics
    │   └── ivBarDetection.ts     # FUTURE: image-based IV bar detection (placeholder)
    └── components/
        ├── LanguageSwitcher.tsx
        ├── UploadSection.tsx     # upload, preview, OCR progress, warnings
        ├── PokemonForm.tsx       # manual correction form (tappable IV bars)
        └── ResultCard.tsx        # verdict, score, reasons, actions, badges
```

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Production build check:

```bash
npm run build && npm run preview
```

## Deploy to Vercel

**Option A — GitHub (recommended):**
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel auto-detects Vite. Defaults are correct (build command `npm run build`, output `dist`). Click **Deploy**.
4. You get a URL like `https://pogo-inventory.vercel.app`.

**Option B — CLI:**
```bash
npm i -g vercel
vercel        # follow prompts; accept defaults
vercel --prod
```

**Netlify alternative:** drag the `dist/` folder (after `npm run build`) onto [app.netlify.com/drop](https://app.netlify.com/drop), or connect the repo with build command `npm run build` and publish directory `dist`.

## Open it on your phone

- **Deployed:** just open the Vercel/Netlify URL in Safari/Chrome on your phone. On iOS, Share → **Add to Home Screen** makes it feel like an app.
- **Local dev on the same Wi-Fi:** run `npm run dev -- --host`, then open the `Network:` URL Vite prints (e.g. `http://192.168.0.12:5173`) on your phone.

Typical flow on the phone: take an in-game screenshot of the appraisal screen → open this app → tap **Choose screenshot** → pick it from your gallery.

## OCR limitations (please read)

Tesseract.js is a general-purpose OCR engine, not a Pokémon GO specialist, so expect:

1. **IVs usually can't be read.** The appraisal screen shows *bars*, not numbers. OCR only picks up IV numbers if your screenshot is from an IV-checker overlay that prints them. This is exactly why the form exists — and why image-based bar detection is the planned next step (see below).
2. **Stylized fonts confuse it.** Pokémon GO's rounded font and translucent backgrounds cause misreads, e.g. `CP 2380` → `GP 2380` (the parser already tolerates this one) or name typos (the parser fuzzy-matches against a known-name list).
3. **Name list is small.** `KNOWN_NAMES` in `src/ocr/ocr.ts` has ~30 species. Names outside the list won't be auto-filled — type them manually or extend the list.
4. **English client only.** OCR loads the `eng` model. Korean in-game screenshots need the `kor` traineddata (`Tesseract.recognize(file, 'kor+eng')`) and Korean name matching.
5. **First run is slow.** Tesseract downloads its WASM + language model (~10 MB) on first use, then caches it.
6. **Confidence is a hint, not a guarantee.** Below 60% the app shows an extra warning, but always review every field — the UI is designed around that assumption.

## Future: image-based IV bar detection

`src/ocr/ivBarDetection.ts` contains the placeholder `detectIvBarsFromImage()` plus two ready helpers (`rgbToHsv`, `fillRatioToIv`). `UploadSection` already calls it in parallel with OCR and will automatically prefer its results once implemented — no other code changes needed.

How it will work:

1. **Load** the screenshot onto an offscreen `<canvas>` and read raw pixels with `getImageData()`.
2. **Normalize** to a reference width (e.g. 1080 px) so coordinates are stable across phone resolutions.
3. **Locate the three bars** by converting pixels to HSV and masking the saturated orange "filled segment" color (plus the pink "15/15 maxed" color). Scanning rows for three stacked horizontal runs of bar-colored pixels finds Attack/Defense/HP in order; a region-of-interest prior (bars live in a predictable band of the appraisal card) narrows the search.
4. **Measure fill**: for each bar, `fillRatio = (rightmost filled pixel − left edge) / track width`, then snap to the nearest of 16 levels: `iv = round(fillRatio × 15)`. The snapping makes the result robust to a few pixels of noise.
5. **Sanity-check**: exactly 3 bars, similar widths, even vertical spacing, fill ratios near multiples of 1/15. Any failure lowers `confidence`, and the app keeps the "please review" warning.

Plain Canvas + typed arrays is enough; if you later want contour detection out of the box, OpenCV.js (`cv.inRange` + `cv.findContours`) does steps 3–4 directly, at the cost of a ~8 MB WASM download.

## Other future improvements

- **Korean OCR** (`kor` traineddata) + Korean species names in the matcher.
- **Full species database** with base stats → real CP/IV cross-validation and league rank calculations (true Poke Genie territory).
- **PvP rank calculator** for Great/Ultra League instead of the "PvP check needed" flag.
- **History list** of evaluated Pokémon saved with IndexedDB.
- **PWA manifest + service worker** for offline use and a proper home-screen icon.
- **Crop hint UI**: let users crop to just the bars/CP region before OCR — smaller, cleaner input dramatically improves accuracy.
- **Batch mode**: upload several screenshots and get a sortable keep/transfer table.

## Tweaking the decision logic

Everything lives in `src/logic/scoring.ts`:
- `WEIGHTS` — points per trait (IV cap, shiny, shadow, legendary, mega, size, legacy move, purpose fit)
- `FLOORS` — the "almost always keep" rules (4-star, shadow legendary, shiny/legendary minimums)
- `THRESHOLDS` — Keep ≥ 75, Maybe ≥ 45, Transfer < 45

Change a number, and the whole app rebalances.
