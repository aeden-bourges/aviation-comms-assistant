# Aviation Communications Assistant

Aviation Communications Assistant is a browser-based MVP that converts ATIS-style aviation communication text into a readable briefing card and structured JSON.

It was built as the Create step of my TKS Focus Project to explore how dense aviation information can be parsed into clearer, reusable data using deterministic rules.

This is an educational prototype, not a certified aviation tool.

## What it does

The app lets a user:

- paste an ATIS-style transcript
- choose from sample transcripts
- parse the transcript into a briefing card
- view the extracted data as JSON
- copy the JSON output
- export the briefing card as a `.txt` file

## Parser output

The parser currently extracts:

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
````

Missing fields return an empty string in JSON and appear as `not detected` in the briefing card.

## How it works

The parser is deterministic. It does not use AI, speech recognition, or a backend.

Basic pipeline:

```txt
raw transcript
→ normalize text
→ split into words
→ search for anchor words
→ extract known fields
→ render briefing card and JSON
```

Example:

```txt
Wind 310 degrees at 12 knots
```

The parser uses:

```txt
"wind" as the start anchor
"knots" as the end boundary
```

and extracts:

```txt
310 degrees at 12 knots
```

For simpler fields, it extracts words after an anchor:

```txt
QNH 1013 → 1013
temperature 22 → 22
observation 1150 zulu → 1150 zulu
```

## Current features

* Deterministic JavaScript parser
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
* Known limitations shown in the interface

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
script.js       parser logic and UI behavior
README.md       project documentation
```

## Known limitations

This is a rule-based MVP, so it only works reliably on predictable ATIS-style transcript patterns.

Current limitations:

* Not intended for operational aviation use
* Does not handle `wind calm`
* Wind parsing currently expects a `knots` boundary
* Complex runway phrasing may overcapture
* Landing and departing runways are not separated yet
* Observation time parsing expects a simple pattern like `observation 1150 zulu`
* Pressure parsing does not preserve whether the source was QNH or altimeter
* Visibility is parsed but not converted between units
* Sky parsing only handles simple cloud patterns ending in `feet`
* Remarks parsing currently captures a fixed number of words after `remarks`

## Why deterministic parsing?

ATIS messages are structured and repetitive, so a deterministic parser is a good MVP approach.

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
* separate landing and departing runways
* preserve pressure type and unit
* support more visibility formats
* improve remarks extraction
* add copy briefing
* eventually explore audio transcription

Audio transcription is intentionally out of scope for the current version because it would require speech-to-text handling and more reliability work.

## Status

Stable MVP complete.

The current version demonstrates the full text-based pipeline:

```txt
raw aviation transcript
→ parsed fields
→ readable briefing
→ structured JSON
→ exportable output
```

## Disclaimer

This project is an educational prototype. It is not certified, validated, or intended for real aviation operations.