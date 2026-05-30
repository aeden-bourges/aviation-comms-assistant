# Aviation Communications Assistant

Aviation Communications Assistant is a browser-based MVP that decodes and structures ATIS-style aviation communication text.

It turns dense aviation notes or transcripts into:

- plain-language decoded notes
- a readable briefing card
- structured JSON

This project was built as the Create step of my TKS Focus Project. It is an educational prototype, not a certified aviation tool.

## What it does

The app lets a user:

- paste an ATIS-style transcript or abbreviated aviation note
- choose from sample transcripts
- decode common aviation abbreviations and compact notes
- extract key fields into a briefing card
- view the extracted data as JSON
- copy the JSON output
- export the briefing card as a `.txt` file

## Main idea

Aviation communication is dense and compressed. A short ATIS note can include abbreviations for runway use, wind, visibility, pressure, temperature, approach type, frequencies, and operational instructions.

This project explores how that kind of domain-specific text can be made easier to inspect using deterministic rules.

The goal is not full aviation language understanding. The goal is to demonstrate a clear text-processing pipeline:

```txt
raw aviation text
→ normalization
→ tokenization
→ rule-based decoding
→ field extraction
→ readable outputs
````

## Current outputs

### Decoded Notes

The decoder explains common abbreviated ATIS patterns, such as:

```txt
ARR ATIS → Arrival ATIS
DEP ATIS → Departure ATIS
ILS APP → ILS approach in use
LDG 31R → Landing runway 31R
DEP RWY 30R → Departure runway 30R
WIND 290 05 KT → Wind from 290 degrees at 5 knots
CAVOK → Ceiling and visibility OK
NOSIG → No significant change expected
```

### Briefing Card

The briefing card extracts aviation fields into a readable format.

The parser currently returns:

```js
{
  airport: "",
  atisIdentifier: "",
  observationTime: "",
  runway: "",
  wind: "",
  visibility: "",
  sky: "",
  pressure: "",
  temperature: "",
  dewpoint: "",
  transition: "",
  remarks: ""
}
```

Missing fields return an empty string in JSON and appear as `not detected` in the briefing card.

### Raw JSON

The JSON output shows the structured data created by the parser.

## Current features

* Deterministic JavaScript parser
* Plain-language decoder for selected ATIS abbreviations
* Airport / facility name extraction
* ATIS identifier validation
* Observation time parsing
* Runway parsing
* Wind parsing
* Visibility parsing in meters, kilometers, and miles
* Basic sky / cloud layer parsing
* Pressure parsing from QNH or altimeter
* Temperature parsing
* Dew point parsing for both `dewpoint` and `dew point`
* Transition level parsing
* Basic remarks parsing
* Briefing card output
* Raw JSON output
* Copy JSON button
* Export briefing as `.txt`
* Sample transcript buttons
* Empty-input guard
* Auto-resizing textarea

## Tech stack

* HTML
* CSS
* JavaScript

No framework.
No backend.
No AI model.

## Project structure

```txt
index.html      page structure
style.css       visual styling
sampleAtis.js   sample transcript data
script.js       parser, decoder, and UI behavior
README.md       project documentation
```

## How it works

The parser and decoder use deterministic rules.

For example, the parser can extract wind from a phrase like:

```txt
Wind 310 degrees at 12 knots
```

by using:

```txt
"wind" as the start anchor
"knots" as the end boundary
```

The decoder handles compact ATIS notation using pattern matching.

For example:

```txt
WIND 290 05 KT
```

becomes:

```txt
Wind from 290 degrees at 5 knots.
```

This makes the system explainable. If something works, the rule can be inspected. If something fails, the limitation is visible.

## Known limitations

This is a rule-based MVP, so it only works reliably on predictable ATIS-style patterns.

Current limitations:

* Not intended for operational aviation use
* Does not fully decode all ICAO, METAR, or ATIS formats
* Does not handle every real-world ATIS wording variation
* Does not handle `wind calm` yet
* Complex runway phrasing may overcapture
* Landing and departing runways are not fully separated in the briefing parser
* Pressure parsing does not preserve whether the source was QNH or altimeter
* Visibility is parsed but not converted between units
* Sky and remarks parsing are basic and pattern-dependent

## Why deterministic parsing?

I used deterministic parsing because ATIS-style communication is structured and repetitive enough for a rule-based MVP.

Benefits:

* simple to understand
* easy to debug
* no API key required
* explainable behavior
* predictable output for known patterns

Tradeoff:

* less flexible than natural-language parsing
* needs new rules for new transcript patterns

## Future improvements

Possible next steps:

* handle `wind calm`
* improve runway parsing
* separate landing and departing runways more reliably
* preserve pressure source and unit
* improve abbreviated note decoding
* support more visibility and weather formats
* improve remarks extraction
* add copy decoded notes
* eventually test audio transcription after the text parser is stronger

Audio transcription is intentionally out of scope for the current version because it would require speech-to-text handling and more reliability work.

## Status

Stable MVP complete.

The current version demonstrates a text-based aviation communication pipeline:

```txt
raw aviation text
→ decoded notes
→ parsed fields
→ readable briefing
→ structured JSON
→ exportable output
```

## Disclaimer

This project is an educational prototype. It is not certified, validated, or intended for real aviation operations.