const rawAtis = document.getElementById("user-input")
const parseButton = document.getElementById("parse-btn")
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
    if (startIndex === -1 || endIndex === -1) {
        return ""
    }

    const sliceEnd = includeEnd ? endIndex + 1 : endIndex
    const fieldWords = words.slice(startIndex + 1, sliceEnd)
    const fieldText = fieldWords.join(" ")
    return fieldText
}

// Known limitation: "calm" wind reports are not currently parsed because the MVP wind parser expects a “knots” end marker.
function extractAfter(words, anchorWord, offset = 1, numberOfWords = 1) {
    const anchorIndex = words.indexOf(anchorWord)
    if (anchorIndex === -1 ) {
        return ""
    }

    const valueStart = anchorIndex + offset
    const valueEnd = valueStart + numberOfWords
    const valueWords = words.slice(valueStart, valueEnd)

    return valueWords.join(" ")
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
Pressure: ${displayField(data.pressure)}
Temperature: ${displayField(data.temperature)}
Dewpoint: ${displayField(data.dewpoint)}
Transition Level: ${displayField(data.transition)}`
}

// Main parser pipeline: normalize text -> split into words -> extract known ATIS fields -> return structured data
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
        const airportWords = words.slice(0, informationIndex)
        airportName = airportWords.join(" ")
        const possibleAtisIdentifier = words[informationIndex + 1] || ""
        if (validAtisIdentifiers.includes(possibleAtisIdentifier)) {
            atisIdentifier = possibleAtisIdentifier
        }
    }

    const windField = extractBetween(words, "wind", "knots")
    const visibilityField =
        extractBetween(words, "visibility", "meters") ||
        extractBetween(words, "visibility", "kilometers") ||
        extractBetween(words, "visibility", "miles")
    const runwayField = extractBetween(words, "runway", "wind", false)

    const pressureField = extractAfter(words, "qnh") || extractAfter(words, "altimeter")
    const temperatureField = extractAfter(words, "temperature")
    const dewpointField = extractAfter(words, "dewpoint") || extractAfterPhrase(words, "dew point")
    const observationTimeField = extractAfter(words, "observation", 1, 2)
    const transitionLevelField = extractAfterPhrase(words, "transition level")

    return {
        airport: airportName,
        atisIdentifier: atisIdentifier,
        observationTime: observationTimeField,
        runway: runwayField,
        wind: windField,
        visibility: visibilityField,
        pressure: pressureField,
        temperature: temperatureField,
        dewpoint: dewpointField,
        transition: transitionLevelField
    }
}

function autoResizeTextarea() {
    rawAtis.style.height = "auto"
    rawAtis.style.height = rawAtis.scrollHeight + 2 + "px"
}

// UI behaviour
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
        briefingOutput.textContent = "Paste or choose an ATIS transcript first."
        jsonOutput.textContent = ""
        return
    }

    const parsedData = parseAtis(inputText)
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

// One button per sample transcript
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