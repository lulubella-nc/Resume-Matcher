# Translating a design image into a resume template

The templates in `apps/frontend/components/resume/` are all data-driven: a design
image tells you *where* things go, and `ResumeData` tells you *what* goes there.
This is the checklist we follow to turn one image into one working template, plus
the files that have to be touched so the builder, the print page and the PDF
renderer all agree.

The worked example throughout is **Editorial** (`editorial`), translated from a
single reference screenshot.

---

## 1. Read the image as a spec, not as inspiration

Measure the reference before writing CSS. For Editorial (838 px wide screenshot of
an A4 page):

| What | In the image | As a ratio | In the template |
| --- | --- | --- | --- |
| Left margin | 56 px | 6.7 % of width | 12–13 mm page margin |
| Rail width | 200 px | 27 % of the content box | `grid-template-columns: 27fr 73fr` |
| Story column | 542 px | 73 % of the content box | same grid, second track |
| Name cap height | ≈ 40 px | 1.45 × the largest heading | `calc(var(--font-size-base) * var(--header-scale) * 1.42)` |
| Section heading | ≈ 26 px | 1.48 × scale | `calc(var(--font-size-base) * var(--section-header-scale) * 1.48)` |
| Body copy | ≈ 14 px | 1 × the page base | `font-size: var(--font-size-base)` |
| Section gap | ≈ 34 px | 2 × the spacing control | `calc(var(--section-gap) * 2.05)` |

Two rules that follow from this:

- **Express sizes as multiples of the CSS variables** (`--font-size-base`,
  `--header-scale`, `--section-gap`, `--item-gap`). The formatting panel must keep
  working on the new template; hard-coded px values break it.
- **Sample the colour instead of guessing it.** Open the image in Python and take
  the most common non-grey pixel inside a heading:

  ```python
  from collections import Counter
  from PIL import Image
  im = Image.open("paralegal-resume-examples.jpg").convert("RGB")
  print(Counter(im.crop((230, 150, 340, 200)).getdata()).most_common(12))
  ```

  Editorial's `gold` accent (`#A98C60`) came from that sample.

## 2. Map every region onto `ResumeData`

Write the mapping down before coding. Editorial's:

| Region | Data |
| --- | --- |
| Portrait | `personalInfo.photo` (data URL or http link) |
| Details block | `personalInfo.location` (labelled "Address"), `phone`, `email`, `website`, `linkedin`, `github` |
| Skills | `additional.technicalSkills` — names only, no rating scale |
| Profile | `summary` |
| Experience | `workExperience` — `title` + `company` on one line, then `years` + `location` |
| Education | `education` — `institution` + `degree` on one line; `description` split on newlines into bullets |
| Projects / certifications / awards | `personalProjects`, `additional.certificationsTraining`, `additional.awards` |
| Anything else | `sectionMeta` + `customSections` (see `DynamicResumeSectionVivid`) |

A field the data model does not have (`education.location` in Editorial's reference)
is **dropped, not faked**. Do not invent a value and do not hard-code the sample
text — the template has to work when the resume is empty.

Notes:

- If the design needs a new per-item value, add a sibling field rather than
  encoding it in a string: the old skill rating sat beside `technicalSkills` on
  purpose, because a level packed into the skill text would leak into every other
  template's PDF.
- **Never render a fact the resume does not hold.** Editorial's reference shows a
  five-dot proficiency scale; the template prints plain skill names, because an
  unrated skill would otherwise display an invented score. If a design element
  needs data the model lacks, leave it out and say so — do not seed a default.
- Sections the user can hide must go through `isSectionVisible(key)` and
  `getSectionDisplayName(key, fallback)` from `lib/utils/section-helpers.ts`.

## 2b. Or add a preset instead of a component

Since the reference library (`*-resume-examples.jpg`) turned out to hold far fewer
designs than images — the same layout recurs across job titles with a different
accent — there is a second, cheaper path: the shared engine
`components/resume/resume-profile.tsx` draws every one of those designs from a preset
in `components/resume/profile-presets.ts`.

Use it when the new design is one of these shapes:

| Preset field | Values |
| --- | --- |
| `layout` | `single`; `rail-right`, `rail-left` (hairline-closed `rail-divider`); `panel-right` (filled panels), `photo-panel` (portrait heads the rail), `night-rail` (dark full-height rail) |
| `header` | `plain`, `centered`, `centered-photo` (portrait over a centred name), `inline` (portrait beside the name), `display` (oversized name over the role), `boxed` (ruled box), `band` (full-bleed colour block), `night` (dark band with a contact strip) |
| `heading` | `plain`, `serif`, `icon-rule`, `icon-plain`, `icon-caps`, `chip`, `rule-label`, `underline` (uppercase over a full rule), `numbered`, `display` (oversized accent label), `tracked-serif` |
| `skills` | `plain`, `bars` (hairline under the name), `ruled` (accent rule), `rule-sep` (neutral rule), `two-col` |
| `entry` | `stacked`, `date-column` (dates in their own left column), `title-right` (location on the title line), `timeline` (spine with a node per entry) |
| `contact` | `inline`, `stacked`, `grid` (label/value) |
| flags | `railContact` / `railContactFirst` (does the rail carry contact, and above or below skills), `accentName`, `largeName`, `italicName`, `titleBar`, `serifHeadings`, `photo`, `railLabelled` |
| colours | `accent`, `surface`, `onSurface` |

Adding one is: an entry in `PROFILE_PRESETS`, an id in `TemplateType`, a
`TEMPLATE_OPTIONS` row, an i18n key in `lib/i18n/template-labels.ts` plus the
`messages/*.json` copy, and the backend `ResumeTemplate` literal. The picker
thumbnail, the print-page allow-list and the dispatch all derive from those tables,
so nothing else needs hand-editing.

Write a component only when a design needs structure the vocabulary cannot express.
Do not stretch the vocabulary until a preset has six conditional branches.

## 3. Build the component and its stylesheet

```
components/resume/resume-<id>.tsx
components/resume/styles/<id>.module.css
```

- Import `styles/_base.module.css` for the shared `.resume-body` defaults and
  `styles/_tokens.css` from the module, then define the template's own tokens on
  the grid root (Editorial defines `--editorial-ink`, `--editorial-body`,
  `--editorial-soft` there).
- Spread `RESUME_SECTION`, `RESUME_SECTION_TITLE` and `resumeItem(bullets)` from
  `page-break-attrs.ts`. Both the print CSS and the preview pagination read those
  attributes; without them the PDF breaks pages differently from the preview.
- Keep the story column **first in the DOM** for two-column layouts and place the
  rail with `grid-column: 1` — a parser then reads profile → experience before the
  sidebar.
- Give headings real `<h3>`/`<h4>` text, keep `text-transform` and `letter-spacing`
  off body copy, and draw decorations with empty spans, not with characters: all
  three keep the PDF text layer clean (see the notes at the top of
  `photo-sidebar.module.css`).
- A portrait is decorative: `alt=""`.

## 4. Register it

Every place that names a template, or the feature it carries:

| File | Change |
| --- | --- |
| `lib/types/template-settings.ts` | `TemplateType`; `TWO_COLUMN_TEMPLATES`; `PHOTO_TEMPLATES`; `TEMPLATE_OPTIONS`; `TEMPLATE_FONT_PRESETS`; `TEMPLATE_LOOK_PRESETS` |
| `components/resume/index.ts` | re-export the component |
| `components/dashboard/resume-component.tsx` | dispatch on `settings.template` |
| `components/builder/template-selector.tsx` | label map + `TemplateThumbnail` branch |
| `components/builder/formatting-controls.tsx` | label map + which controls apply (accent, photo) |
| `app/print/resumes/[id]/page.tsx` | `parseTemplate` allow-list (`parseAccentColor` reads `ACCENT_COLOR_MAP`, so it needs no edit) |
| `apps/backend/app/schemas/models.py` | `ResumeTemplate`, `PageFitSettings.accentColor` |
| `apps/backend/app/routers/resumes.py` | `/pdf` query params + docstring |
| `apps/backend/app/services/ats_parse/checks.py` | `TWO_COLUMN_TEMPLATES` |
| `apps/backend/app/services/ats_parse/roundtrip.py` | `CONTACT_ORDER_BY_TEMPLATE`, `ENTRY_ORDER_BY_TEMPLATE` |
| `apps/frontend/messages/*.json` (7 locales) | template name/description, any new accent or control labels |

`TEMPLATE_LOOK_PRESETS` is what makes a new template open looking like its
reference: selecting it seeds the signature accent and portrait size once, and the
user can still change both afterwards.

## 5. Make the new controls real

If the design shows a value the model stores separately (skill dots, a portrait,
a labelled contact block), the builder needs somewhere to edit it:

- `components/builder/forms/*.tsx` — the control.
- `ResumeFallbackLabels` in `resume-component.tsx` — any label the template prints
  itself (Editorial's "Details", "Address", "Phone", …), so it can be translated.
  Build the label set with `lib/i18n/document-labels.ts` and bind it to the **content**
  language (`makeTranslator(contentLanguage)`), never to the UI language: the reader may
  run the app in English and write resumes in Chinese. A template that falls back to
  hard-coded English is a bug, not a default.
- `lib/utils/*.ts` — the pure parsing/clamping helpers, unit-tested on their own.

## 6. Wire the ATS round trip

Two column templates get an extra check ("is this readable?"), and the round-trip
check compares the *order* fields come out of `pdfminer` against the order the
template prints them. Fill both maps from the actual render, not from intuition:

- contact order = the order the rows appear in the DOM/print;
- entry order = the order the words land in the extracted text (`"Title, Company"`
  on one line means `title` before `company`).

## 7. Tests

```
tests/resume-<id>.test.tsx   # rendering, empty sections, photo, headings, reading order
tests/<id>-...               # any new helper or control
tests/template-registration.test.ts   # counts presets from PROFILE_PRESET_IDS, no number to bump
```

Prefer assertions on text and attributes over class names (CSS modules are hashed):
`data-photo-shape` and `data-earlier-experience` exist for this.

## 8. Sample assets and the README row

`assets/pdf-templates/<id>.webp` (one A4 page at ~150 dpi) and `<id>.pdf`, then a
row in the README template table. Generate both from the real component markup so
the sample cannot drift from the code.

The dump lives in the repo rather than in a throwaway spec:
`apps/frontend/tests/dump-template-markup.test.tsx`. It renders a fixed, invented
resume and writes the markup. It only runs when `DUMP_TEMPLATES` is set, so
`npm test` neither writes files nor depends on it.

```bash
cd apps/frontend
DUMP_TEMPLATES=editorial npx vitest run --pool=threads --maxWorkers=1 \
  tests/dump-template-markup.test.tsx      # omit the variable to dump every preset
cd ../..
apps/backend/.venv/Scripts/python.exe scripts/make-template-assets.py \
  --template editorial --css profile --html .workbuddy/tmp/editorial.html
```

`--css` names the stylesheet to inline: the preset templates all share
`profile.module.css`, the older templates use their own. The script de-hashes the
CSS-module names, inlines `_tokens.css` / `_base.module.css` / `<css>.module.css`,
pads the thumbnail to a full A4 page and writes both files.

**The sample resume is invented on purpose.** These files are committed, so a real
resume would publish a name, a phone number, an email address and a face. That is
also why the portrait is a drawn silhouette instead of a photo. If you need more
content to fill a page, add invented entries to `DEMO_RESUME`; never point the dump
at `apps/backend/data/`.

## 9. Verify

```bash
cd apps/frontend
npx tsc --noEmit
npx oxlint
node scripts/swiss-guard.mjs        # components/resume and app/print are exempt
npx vitest run --pool=threads --maxWorkers=1   # the default forks pool does not start here
```

Then look at the page. Two checks that catch what types cannot:

1. **Geometry** — for each page size and margin pair, the two column widths plus the
   gap must equal the content box, and `scrollWidth` must not exceed `clientWidth`
   in either column (the rule `tests/integration/test_pdf_grid_geometry.py` uses).
2. **Visual diff against the reference** — screenshot the rendered page and compare
   it with the image side by side: heading weight and colour, the name/heading size
   ratio, gap between sections, indent of bullets, alignment of the portrait with
   the name. Fix the numbers, not the sample content.

## 10. Checklist

- [ ] Every string comes from `ResumeData` or a translated label
- [ ] Empty sections disappear; an empty resume still renders a page
- [ ] Sizes derive from the settings variables, so the formatting panel works
- [ ] Photo is decorative, sections carry page-break attributes
- [ ] Registered in all 11 places above, all 7 locales updated
- [ ] ATS arrays and both round-trip maps updated
- [ ] Tests, typecheck, lint, guard, geometry and a visual pass
- [ ] Sample webp/pdf + README row
