# Aviation Communications Assistant

Aviation Communications Assistant is a web-based MVP that converts ATIS-style aviation communication text into a pilot-readable briefing card and structured JSON.

I built this as the Create step of my TKS Focus Project. The goal was to explore how dense aviation communication can be transformed into clearer, structured information using a deterministic parser.

This is not a certified aviation system. It is an educational prototype focused on proving the core pipeline:

```txt
raw aviation communication text
→ normalized text
→ tokenized words
→ deterministic field extraction
→ readable briefing card
→ structured JSON
```

## Project goal

ATIS messages are information-dense and repetitive. They usually contain important operational details such as the airport or facility name, ATIS identifier, runway information, wind, visibility, pressure, temperature, dew point, transition level, and other remarks.

The goal of this MVP is to test whether a simple browser-based tool can take a raw ATIS-style transcript and convert it into something easier to read, reuse, and inspect.

The focus is not full natural-language understanding yet. The focus is a working deterministic parser that extracts predictable aviation fields from predictable transcript patterns.

## Current app

The app lets a user:

- paste or type an ATIS-style transcript manually
- choose from sample ATIS transcripts
- parse the transcript into a briefing card
- view the raw structured JSON output
- copy the JSON output
- see known limitations directly in the interface

## Current features

- Manual transcript input
- Sample transcript buttons
- Textarea auto-resizing
- Empty-input guard
- Deterministic JavaScript parser
- Airport or facility name extraction
- ATIS identifier extraction with validation
- Runway parsing
- Wind parsing
- Visibility parsing
- QNH parsing
- Temperature parsing
- Dewpoint parsing
- Transition level parsing
- Human-readable briefing card
- Raw JSON output
- Copy JSON button
- Copy status feedback
- Known limitations section
- Dark technical/editorial UI style

## Current parser fields

The current parser returns this structure:

```js
{
  airport: "",
  atisIdentifier: "",
  runway: "",
  wind: "",
  visibility: "",
  qnh: "",
  temperature: "",
  dewpoint: "",
  transition: ""
}
```

Missing fields return an empty string in the raw JSON output.

In the briefing card, missing fields are displayed as:

```txt
not detected
```

This keeps a separation between:

```txt
raw parser data = actual extracted values
briefing card = human-readable presentation
```

## How the parser works

The parser uses deterministic rules, not AI.

It follows this basic process:

```txt
1. normalize the text
2. remove basic punctuation
3. split the text into words
4. look for anchor words
5. extract words between known boundaries
6. return a structured JavaScript object
7. render the object as a briefing card and JSON
```

Current normalization:

```js
const normalizedText = text
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll(",", "")
```

Current tokenization:

```js
const words = normalizedText.trim().split(/\s+/)
```

For example, in this transcript fragment:

```txt
Wind 310 degrees at 12 knots.
```

the parser uses:

```txt
"wind" = start anchor
"knots" = end boundary
```

and extracts:

```txt
310 degrees at 12 knots
```

For single-value fields, it uses an anchor word and an offset.

For example:

```txt
QNH 1013
```

uses:

```txt
"qnh" = anchor
next word = value
```

and extracts:

```txt
1013
```

## Main helper functions

The parser currently uses these main helper functions:

### `extractBetween()`

Extracts a field between a start anchor and an end boundary.

Used for fields like:

- wind
- visibility
- runway

### `extractAfter()`

Extracts a value after an anchor word.

Used for fields like:

- QNH
- temperature
- dewpoint
- transition level

### `displayField()`

Controls how missing fields appear in the briefing card.

Raw JSON keeps missing values as empty strings, while the briefing card shows `not detected`.

### `formatBriefing()`

Turns the parsed object into a human-readable briefing card.

### `parseAtis()`

Runs the main parser pipeline.

## UI architecture

The app is split into four files:

```txt
index.html
style.css
sampleAtis.js
script.js
```

### `index.html`

Defines the page structure:

- title
- project explanation
- raw input textarea
- sample transcript buttons container
- Parse button
- briefing card output
- raw JSON output
- Copy JSON button
- known limitations section

### `style.css`

Defines the visual design system.

The current design direction is:

```txt
technical editorial notebook
+ public engineering log
+ systems research journal
```

The visual style intentionally avoids:

- startup SaaS aesthetic
- cyberpunk AI look
- productivity influencer style
- hacker cosplay
- minimal luxury branding

### `sampleAtis.js`

Stores sample transcript data as labeled objects.

Example structure:

```js
{
    label: "Clean Dubai ATIS",
    text: `Dubai Information Bravo. Runway 30 left. Wind 310 degrees at 12 knots. Visibility 5000 meters. QNH 1013. Temperature 22. Dewpoint 10. Transition level 60.`
}
```

This allows the app to dynamically generate sample buttons.

### `script.js`

Contains:

- DOM references
- parser helper functions
- the main `parseAtis()` function
- briefing formatting
- textarea auto-resizing
- Parse button behavior
- Copy JSON behavior
- dynamic sample button generation

## Tech stack

- HTML
- CSS
- JavaScript

No framework is currently used.

No backend is currently used.

No AI model is currently used.

The project is intentionally simple so the parser logic remains visible and explainable.

## Current robustness handling

The app currently handles:

- mixed capitalization
- periods and commas
- multiple spaces
- line breaks
- missing fields
- missing `information` keyword
- invalid ATIS identifiers
- missing values after anchors
- empty input
- sample transcript selection
- textarea resizing
- JSON copying

Examples of tested cases:

- clean Dubai ATIS
- mixed capitalization
- line breaks and spacing
- runway `30L` format
- complex runway wording
- missing `information` keyword
- invalid ATIS identifier
- `alfa` spelling
- missing QNH value

## Known limitations

This is a minimum viable prototype, not a full aviation NLP system.

Known limitations:

- The parser expects predictable ATIS-style transcript patterns.
- It does not currently handle `wind calm`.
- It expects wind reports to end with `knots`.
- Complex runway phrasing may overcapture.
- It currently handles `dewpoint` better than `dew point`.
- It does not yet fully support visibility in miles or kilometers.
- It does not yet parse observation time.
- It does not yet parse sky condition or cloud layers.
- It does not yet extract advisories, cautions, or remarks into separate fields.
- It does not yet separate landing and departing runways into different fields.
- It is not designed for real operational aviation use.

## Example limitation

For a transcript like:

```txt
Dubai information echo landing runway 30 left departing runway 30 right wind 310 degrees at 12 knots
```

the current parser may return:

```txt
Runway: 30 left departing runway 30 right
```

This happens because the parser currently finds the first `runway` anchor and captures everything until `wind`.

A future version should separate this into:

```txt
Landing runway: 30 left
Departing runway: 30 right
```

## Why deterministic parsing?

This MVP uses deterministic parsing because ATIS messages are structured and repetitive.

Advantages:

- simple to understand
- easy to debug
- no API key required
- no backend required
- explainable extraction logic
- predictable behavior for known transcript patterns

Tradeoff:

- less flexible than a full natural-language parser
- weaker on unusual phrasing
- requires manually adding rules for new patterns

## What I learned

This project was mainly about building a real parsing pipeline, not just a webpage.

Key concepts learned:

- DOM interaction
- event listeners
- textarea input handling
- output rendering
- JavaScript objects
- JSON formatting
- `JSON.stringify()`
- string normalization
- tokenization
- `split()`
- `indexOf()`
- `slice()`
- `join()`
- anchor-word parsing
- defensive parsing
- helper function abstraction
- separating data from presentation
- building sample-driven tests
- UI polish for a demo-ready MVP

The biggest architectural shift was moving from hardcoded positions to rule-based extraction.

Instead of relying on fixed word indexes, the parser searches for meaningful anchor words such as:

```txt
information
runway
wind
visibility
qnh
temperature
dewpoint
transition
```

This made the parser more flexible and easier to expand.

## Next planned improvements

The next development phase is targeted parser expansion, not a full rewrite.

Planned near-term improvements:

- support both `dewpoint` and `dew point`
- parse observation time in UTC
- support altimeter settings as an alternative to QNH
- support visibility in meters, kilometers, and miles
- improve runway parsing
- separate landing and departing runway fields when clearly stated
- parse sky condition and cloud layers
- extract remarks, advisories, and cautions
- export the briefing card as a `.txt` file
- possibly add Copy Briefing

Possible future extension:

- audio upload and transcription

Audio transcription is not part of the current MVP because it would likely require a speech-to-text system, external API, backend handling, or additional reliability work. It is better treated as a later extension after the text parser is stronger.

## Project status

Current status:

```txt
Stable MVP complete
```

Next phase:

```txt
Targeted parser expansion and export features
```

Immediate next steps:

```txt
1. Push current MVP to GitHub as a stable checkpoint
2. Add support for both "dewpoint" and "dew point"
3. Expand common ATIS field coverage
4. Add export briefing as .txt
5. Deploy the app
6. Record final demo video
```

## Disclaimer

This project is an educational prototype.

It is not certified, validated, or yet intended for operational aviation use.