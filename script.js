const rawAtis = document.getElementById("user-input")
const parseButton = document.getElementById("parse-btn")
const decodedOutput = document.getElementById("decoded-output")
const briefingOutput = document.getElementById("briefing-output")
const jsonOutput = document.getElementById("json-output")
const sampleButtonsContainer = document.getElementById("sample-buttons")
const copyJsonButton = document.getElementById("copy-json-btn")
const copyStatus = document.getElementById("copy-status")
const exportBriefingButton = document.getElementById("export-briefing-btn")
const exportStatus = document.getElementById("export-status")

function extractBetween(words, startWord, endWord, includeEnd = true) {
    const startIndex = words.indexOf(startWord)
    const endIndex = words.indexOf(endWord)

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        return ""
    }

    const sliceEnd = includeEnd ? endIndex + 1 : endIndex
    return words.slice(startIndex + 1, sliceEnd).join(" ")
}

// Known limitation: "calm" wind reports are not currently parsed because the MVP wind parser expects a "knots" end marker.
function extractAfter(words, anchorWord, offset = 1, numberOfWords = 1) {
    const anchorIndex = words.indexOf(anchorWord)

    if (anchorIndex === -1) {
        return ""
    }

    const valueStart = anchorIndex + offset
    const valueEnd = valueStart + numberOfWords

    return words.slice(valueStart, valueEnd).join(" ")
}

function extractAfterPhrase(words, anchorPhrase, offset = 1) {
    const anchorWords = anchorPhrase.split(" ")

    for (let i = 0; i <= words.length - anchorWords.length; i++) {
        const possibleMatch = words.slice(i, i + anchorWords.length)

        if (possibleMatch.join(" ") === anchorPhrase) {
            return words[i + anchorWords.length + offset - 1] || ""
        }
    }

    return ""
}

function displayField(value) {
    return value || "not detected"
}

function formatBriefing(data) {
    return `Airport: ${displayField(data.airport)}
ATIS: ${displayField(data.atisIdentifier)}
Observation Time: ${displayField(data.observationTime)}
Runway: ${displayField(data.runway)}
Wind: ${displayField(data.wind)}
Visibility: ${displayField(data.visibility)}
Sky: ${displayField(data.sky)}
Pressure: ${displayField(data.pressure)}
Temperature: ${displayField(data.temperature)}
Dewpoint: ${displayField(data.dewpoint)}
Transition Level: ${displayField(data.transition)}
Remarks: ${displayField(data.remarks)}`
}

function decodeAtisNotes(text) {
    const normalizedText = text
        .toUpperCase()
        .replaceAll(",", "")

    const lines = normalizedText
        .split(/\n+/)
        .map(function(line) {
            return line.trim()
        })
        .filter(function(line) {
            return line !== ""
        })

    const decodedNotes = []

    for (const line of lines) {
        if (line.includes("ARR ATIS")) {
            decodedNotes.push("Arrival ATIS.")
        }

        if (line.includes("DEP ATIS")) {
            decodedNotes.push("Departure ATIS.")
        }

        let match = line.match(/\bATIS\s+([A-Z])\b/)
        if (match) {
            decodedNotes.push(`ATIS information ${match[1]}.`)
        }

        match = line.match(/\bINFO\s+([A-Z])\b/)
        if (match) {
            decodedNotes.push(`Information ${match[1]} received or in use.`)
        }

        match = line.match(/\b(\d{4}Z)\b/)
        if (match) {
            decodedNotes.push(`Observation time: ${match[1]}.`)
        }

        if (line.includes("ILS APP")) {
            decodedNotes.push("ILS approach in use.")
        }

        match = line.match(/\bLDG\s+(\d{2}[LRC]?)\b/)
        if (match) {
            decodedNotes.push(`Landing runway: ${match[1]}.`)
        }

        match = line.match(/\bDEP\s+RWY\s+(\d{2}[LRC]?)\b/)
        if (match) {
            decodedNotes.push(`Departure runway: ${match[1]}.`)
        }

        match = line.match(/\bRWY\s+(\d{2}[LRC]?)\b/)
        if (match && !line.includes("DEP RWY")) {
            decodedNotes.push(`Runway reference: ${match[1]}.`)
        }

        match = line.match(/\bWIND\s+(\d{3})\s+(\d{2})\s+KT\b/)
        if (match) {
            decodedNotes.push(`Wind from ${match[1]} degrees at ${match[2]} knots.`)
        }

        match = line.match(/\bWIND DIR\s+(\d{3})\s+V\s+(\d{3})\b/)
        if (match) {
            decodedNotes.push(`Wind direction variable between ${match[1]} and ${match[2]} degrees.`)
        }

        if (line.includes("CAVOK")) {
            decodedNotes.push("CAVOK: ceiling and visibility OK.")
        }

        match = line.match(/\bVIS\s+(\d+)\s*(M|KM|METERS|KILOMETERS|MILES)\b/)
        if (match) {
            let unit = match[2]

            if (unit === "M") {
                unit = "meters"
            } else if (unit === "KM") {
                unit = "kilometers"
            } else {
                unit = unit.toLowerCase()
            }

            decodedNotes.push(`Visibility: ${match[1]} ${unit}.`)
        }

        match = line.match(/\bVISIBILITY\s+(\d+)\s+(METERS|KILOMETERS|MILES)\b/)
        if (match) {
            decodedNotes.push(`Visibility: ${match[1]} ${match[2].toLowerCase()}.`)
        }

        match = line.match(/\bT\s+(-?\d{1,2})\b/)
        if (match) {
            decodedNotes.push(`Temperature: ${match[1]}°C.`)
        }

        match = line.match(/\bDP\s+(-?\d{1,2})\b/)
        if (match) {
            decodedNotes.push(`Dew point: ${match[1]}°C.`)
        }

        match = line.match(/\bQNH\s+(\d{4})\b/)
        if (match) {
            decodedNotes.push(`QNH: ${match[1]} hPa.`)
        }

        if (line.includes("NOSIG")) {
            decodedNotes.push("No significant change expected.")
        }

        if (line.includes("APCH")) {
            decodedNotes.push("APCH: approach.")
        }

        match = line.match(/\bFREQ\s+(IS\s+)?([\d\s.]+)/)
        if (match) {
            const frequency = match[2].replace(/\s+/g, "")
            decodedNotes.push(`Frequency: ${frequency}.`)
        }

        if (line.includes("ATC")) {
            decodedNotes.push("ATC: air traffic control.")
        }

        if (line.includes("AC TYPE")) {
            decodedNotes.push("AC type: aircraft type.")
        }

        if (line.includes("PARALLEL RWY OPERATION")) {
            decodedNotes.push("Parallel runway operations are in progress.")
        }

        if (line.includes("MINIMIZE RWY OCCUPANCY")) {
            decodedNotes.push("Pilots should minimize runway occupancy time.")
        }

        if (line.includes("VACATING RWY")) {
            decodedNotes.push("After vacating the runway, pilots should continue taxiing without delay.")
        }

        if (line.includes("CLR LIMIT")) {
            decodedNotes.push("CLR limit: clearance limit.")
        }

        if (line.includes("ON FIRST CONTACT STATE AC TYPE")) {
            decodedNotes.push("On first contact, pilots should state aircraft type.")
        }
    }

    if (decodedNotes.length === 0) {
        return "No decoded notes detected."
    }

    return decodedNotes.join("\n")
}

function parseAtis(text) {
    const normalizedText = text
        .toLowerCase()
        .replaceAll(".", "")
        .replaceAll(",", "")

    const words = normalizedText.trim().split(/\s+/)

    const validAtisIdentifiers = [
        "alpha", "alfa", "bravo", "charlie", "delta", "echo", "foxtrot",
        "golf", "hotel", "india", "indigo", "juliett", "juliet", "kilo",
        "lima", "mike", "november", "oscar", "papa", "quebec", "romeo",
        "sierra", "tango", "uniform", "victor", "whiskey", "whisky", "xray",
        "x-ray", "yankee", "zulu"
    ]

    const informationIndex = words.indexOf("information")

    let airportName = ""
    let atisIdentifier = ""

    if (informationIndex !== -1) {
        airportName = words.slice(0, informationIndex).join(" ")

        const possibleAtisIdentifier = words[informationIndex + 1] || ""
        if (validAtisIdentifiers.includes(possibleAtisIdentifier)) {
            atisIdentifier = possibleAtisIdentifier
        }
    }

    const observationTimeField = extractAfter(words, "observation", 1, 2)
    const runwayField = extractBetween(words, "runway", "wind", false)
    const windField = extractBetween(words, "wind", "knots")

    const visibilityField =
        extractBetween(words, "visibility", "meters") ||
        extractBetween(words, "visibility", "kilometers") ||
        extractBetween(words, "visibility", "miles")

    const skyField =
        extractBetween(words, "clouds", "feet") ||
        extractBetween(words, "cloud", "feet")

    const pressureField =
        extractAfter(words, "qnh") ||
        extractAfter(words, "altimeter")

    const temperatureField = extractAfter(words, "temperature")
    const dewpointField = extractAfter(words, "dewpoint") || extractAfterPhrase(words, "dew point")
    const transitionLevelField = extractAfterPhrase(words, "transition level")
    const remarksField = extractAfter(words, "remarks", 1, 5)

    return {
        airport: airportName,
        atisIdentifier: atisIdentifier,
        observationTime: observationTimeField,
        runway: runwayField,
        wind: windField,
        visibility: visibilityField,
        sky: skyField,
        pressure: pressureField,
        temperature: temperatureField,
        dewpoint: dewpointField,
        transition: transitionLevelField,
        remarks: remarksField
    }
}

function autoResizeTextarea() {
    rawAtis.style.height = "auto"
    rawAtis.style.height = rawAtis.scrollHeight + 2 + "px"
}

rawAtis.addEventListener("input", function() {
    autoResizeTextarea()
    copyStatus.textContent = ""
    exportStatus.textContent = ""
})

parseButton.addEventListener("click", function() {
    const inputText = rawAtis.value

    copyStatus.textContent = ""
    exportStatus.textContent = ""

    if (inputText.trim() === "") {
        decodedOutput.textContent = ""
        briefingOutput.textContent = "Paste or choose an ATIS transcript first."
        jsonOutput.textContent = ""
        return
    }

    const parsedData = parseAtis(inputText)

    decodedOutput.textContent = decodeAtisNotes(inputText)
    briefingOutput.textContent = formatBriefing(parsedData)
    jsonOutput.textContent = JSON.stringify(parsedData, null, 2)
})

copyJsonButton.addEventListener("click", function() {
    const jsonText = jsonOutput.textContent

    if (jsonText.trim() === "") {
        copyStatus.textContent = "No JSON to copy yet."
        return
    }

    navigator.clipboard.writeText(jsonText)
    copyStatus.textContent = "JSON copied."
})

exportBriefingButton.addEventListener("click", function() {
    const briefingText = briefingOutput.textContent

    if (briefingText.trim() === "" || briefingText === "Paste or choose an ATIS transcript first.") {
        exportStatus.textContent = "No briefing to export yet."
        return
    }

    const file = new Blob([briefingText], { type: "text/plain" })
    const url = URL.createObjectURL(file)

    const link = document.createElement("a")
    link.href = url
    link.download = "atis-briefing.txt"
    link.click()

    URL.revokeObjectURL(url)
    exportStatus.textContent = "Briefing exported."
})

for (const sample of sampleAtis) {
    const button = document.createElement("button")

    button.textContent = sample.label

    button.addEventListener("click", function() {
        rawAtis.value = sample.text
        autoResizeTextarea()
        copyStatus.textContent = ""
        exportStatus.textContent = ""
    })

    sampleButtonsContainer.appendChild(button)
}