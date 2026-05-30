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
const copyDecodedButton = document.getElementById("copy-decoded-btn")
const decodedStatus = document.getElementById("decoded-status")

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

function expandCloudLayer(layer) {
    return layer
        .replaceAll("FEW", "few clouds ")
        .replaceAll("SCT", "scattered clouds ")
        .replaceAll("BKN", "broken clouds ")
        .replaceAll("OVC", "overcast clouds ")
        .replaceAll("CB", "cumulonimbus")
        .replace(/\s+/g, " ")
        .trim()
}

function decodeAtisNotes(text) {
    const airportNames = {
        OMAA: "Abu Dhabi International Airport",
        OMDB: "Dubai International Airport",
        SBSJ: "São José dos Campos Airport",
        SBBR: "Brasília International Airport",
        MEM: "Memphis International Airport",
        VVTS: "Tan Son Nhat International Airport"
    }

    const rawText = text
        .toUpperCase()
        .replaceAll(",", " ")

    const lines = rawText
        .split(/\n+/)
        .map(function(line) {
            return line.trim().replace(/\s+/g, " ")
        })
        .filter(function(line) {
            return line !== ""
        })

    const allText = lines.join(" ")
    const decodedNotes = []

    function addNote(note) {
        if (!decodedNotes.includes(note)) {
            decodedNotes.push(note)
        }
    }

    for (const airportCode in airportNames) {
        if (allText.includes(airportCode)) {
            addNote(`Airport: ${airportNames[airportCode]} (${airportCode}).`)
        }
    }

    if (allText.includes("ARR ATIS")) {
        addNote("Arrival ATIS.")
    }

    if (allText.includes("DEP ATIS")) {
        addNote("Departure ATIS.")
    }

    let match = allText.match(/\bATIS\s+([A-Z])\b/)
    if (match && !allText.includes("END OF ATIS " + match[1])) {
        addNote(`ATIS information ${match[1]}.`)
    }

    match = allText.match(/\bINFO\s+([A-Z])\b/)
    if (match) {
        addNote(`Information ${match[1]} received or in use.`)
    }

    match = allText.match(/\bEND OF ATIS\s+([A-Z])\b/)
    if (match) {
        addNote(`End of ATIS information ${match[1]}.`)
    }

    for (const timeMatch of allText.matchAll(/\b(\d{4}Z)\b/g)) {
        addNote(`Observation time: ${timeMatch[1]}.`)
    }

    if (allText.includes("ILS APP") || allText.includes("ILS APCH")) {
        addNote("ILS approach in use.")
    }

    match = allText.match(/\bEXPECT\s+ILS\s+([A-Z])?\s*RWY\s?(\d{2}[LRC]?)\b/)
    if (match) {
        const approachType = match[1] ? ` ${match[1]}` : ""
        addNote(`Expect ILS${approachType} approach to runway ${match[2]}.`)
    }

    for (const ilsRunwayMatch of allText.matchAll(/\bILS\s+APCH\s+IN\s+USE\s+(?:RY|RWY)\s+([\dA-Z\s]+)/g)) {
        addNote(`ILS approach runway information: ${ilsRunwayMatch[1].trim()}.`)
    }

    for (const ldgMatch of allText.matchAll(/\bLDG\s+(?:RWY\s*)?(\d{2}[LRC]?)\b/g)) {
        addNote(`Landing runway: ${ldgMatch[1]}.`)
    }

    for (const depRunwayMatch of allText.matchAll(/\bDEP\s+RWY\s+(\d{2}[LRC]?)\b/g)) {
        addNote(`Departure runway: ${depRunwayMatch[1]}.`)
    }

    for (const takeoffMatch of allText.matchAll(/\bTAKEOFF\s+RWY\s+(\d{2}[LRC]?)\b/g)) {
        addNote(`Takeoff runway: ${takeoffMatch[1]}.`)
    }

    for (const runwayMatch of allText.matchAll(/\bRWY\s+(\d{1,2}[LRC]?)\b/g)) {
        addNote(`Runway reference: ${runwayMatch[1]}.`)
    }

    for (const windMatch of allText.matchAll(/\bWIND(?:\s+RWY\s+(\d{2}[LRC]?))?(?:\s+TDZ)?\s+(\d{3})(?:\/|\s+)(\d{1,2})\s*KT\b/g)) {
        const runwayText = windMatch[1] ? ` on runway ${windMatch[1]}` : ""
        addNote(`Wind${runwayText}: from ${windMatch[2]} degrees at ${windMatch[3]} knots.`)
    }

    match = allText.match(/\bWIND DIR\s+(\d{3})\s+V\s+(\d{3})\b/)
    if (match) {
        addNote(`Wind direction variable between ${match[1]} and ${match[2]} degrees.`)
    }

    if (allText.includes("CAVOK")) {
        addNote("CAVOK: ceiling and visibility OK.")
    }

    for (const visMatch of allText.matchAll(/\bVIS(?:\s+RWY\s+(\d{2}[LRC]?))?(?:\s+TDZ)?\s+(\d+)\s*(M|KM|METERS|KILOMETERS|MILES)\b/g)) {
        const runwayText = visMatch[1] ? ` on runway ${visMatch[1]}` : ""
        let unit = visMatch[3]

        if (unit === "M") {
            unit = "meters"
        } else if (unit === "KM") {
            unit = "kilometers"
        } else {
            unit = unit.toLowerCase()
        }

        addNote(`Visibility${runwayText}: ${visMatch[2]} ${unit}.`)
    }

    match = allText.match(/\bVISIBILITY\s+(\d+)\s+(METERS|KILOMETERS|MILES)\b/)
    if (match) {
        addNote(`Visibility: ${match[1]} ${match[2].toLowerCase()}.`)
    }

    match = allText.match(/\b(\d{1,2})SM\b/)
    if (match) {
        addNote(`Visibility: ${match[1]} statute miles.`)
    }

    for (const cloudMatch of allText.matchAll(/\bCLD(?:\s+RWY\s+\d{2}[LRC]?)?\s+([^\.]+)/g)) {
        const cloudText = expandCloudLayer(cloudMatch[1].trim())
        addNote(`Clouds: ${cloudText}.`)
    }

    const compactCloudMatches = [...allText.matchAll(/\b(FEW|SCT|BKN|OVC)\d{3}\b/g)]
    if (compactCloudMatches.length > 0 && !allText.includes("CLD")) {
        const layers = compactCloudMatches.map(function(layerMatch) {
            return layerMatch[0]
        })
        addNote(`Cloud layers: ${expandCloudLayer(layers.join(" "))}.`)
    }

    match = allText.match(/\bT\s*(-?\d{1,2})\b/)
    if (match) {
        addNote(`Temperature: ${match[1]}°C.`)
    }

    match = allText.match(/\bDP\s*(-?\d{1,2})\b/)
    if (match) {
        addNote(`Dew point: ${match[1]}°C.`)
    }

    match = allText.match(/\b(-?\d{2})\/(-?\d{2})\b/)
    if (match) {
        addNote(`Temperature: ${match[1]}°C.`)
        addNote(`Dew point: ${match[2]}°C.`)
    }

    match = allText.match(/\bQNH\s*(\d{4})(?:HPA)?\b/)
    if (match) {
        addNote(`QNH: ${match[1]} hPa.`)
    }

    match = allText.match(/\bA(\d{4})\b/)
    if (match) {
        const altimeter = `${match[1].slice(0, 2)}.${match[1].slice(2)}`
        addNote(`Altimeter setting: ${altimeter} inHg.`)
    }

    if (allText.includes("NOSIG")) {
        addNote("No significant change expected.")
    }

    match = allText.match(/\bTRL\s+FL?(\d{3})\b/)
    if (match) {
        addNote(`Transition level: flight level ${match[1]}.`)
    }

    if (allText.includes("RSCD")) {
        addNote("Runway surface condition information is included.")
    }

    if (allText.includes("BRAKING CONDITIONS NOT REPORTED")) {
        addNote("Runway braking conditions were not reported.")
    }

    if (allText.includes("TYPE OF DEPOSIT NOT REPORTED")) {
        addNote("Runway surface deposit type was not reported.")
    }

    match = allText.match(/\bRWYCC:\s*([0-9\/\s]+)\b/)
    if (match) {
        addNote(`Runway condition code: ${match[1].trim()}.`)
    }

    match = allText.match(/\bRCR\s+([0-9\s]+)\b/)
    if (match) {
        addNote(`Runway condition report: ${match[1].trim()}.`)
    }

    if (allText.includes("ALS INOP")) {
        addNote("Approach lighting system is inoperative.")
    }

    if (allText.includes("PAPI OTS")) {
        addNote("PAPI is out of service.")
    }

    if (allText.includes("GS OTS")) {
        addNote("Glide slope is out of service.")
    }

    if (allText.includes("ILS RWY") && allText.includes("OTS")) {
        addNote("An ILS runway system is out of service.")
    }

    if (allText.includes("TACAN OTS")) {
        addNote("TACAN is out of service.")
    }

    if (allText.includes("BIRDS") || allText.includes("FLOCK OF BIRDS") || allText.includes("BIRD ACTIVITY")) {
        addNote("Bird activity reported.")
    }

    if (allText.includes("AEROMODELLING AREA")) {
        addNote("Aeromodelling activity reported near the aerodrome.")
    }

    if (allText.includes("APCH")) {
        addNote("APCH: approach.")
    }

    match = allText.match(/\bFREQ(?:\s+IS)?\s+([\d\s.]+)/)
    if (match) {
        const frequency = match[1].replace(/\s+/g, "")
        addNote(`Frequency: ${frequency}.`)
    }

    if (allText.includes("ATC")) {
        addNote("ATC: air traffic control.")
    }

    if (allText.includes("AC TYPE")) {
        addNote("AC type: aircraft type.")
    }

    if (allText.includes("PARALLEL RWY OPERATION")) {
        addNote("Parallel runway operations are in progress.")
    }

    if (allText.includes("MINIMIZE RWY OCCUPANCY")) {
        addNote("Pilots should minimize runway occupancy time.")
    }

    if (allText.includes("VACATING RWY")) {
        addNote("After vacating the runway, pilots should continue taxiing without delay.")
    }

    if (allText.includes("CLR LIMIT")) {
        addNote("CLR limit: clearance limit.")
    }

    if (allText.includes("ON FIRST CONTACT STATE AC TYPE")) {
        addNote("On first contact, pilots should state aircraft type.")
    }

    if (allText.includes("READBACK ALL RWY HOLD SHORT INSTRUCTIONS")) {
        addNote("Pilots must read back all runway hold-short instructions.")
    }

    if (allText.includes("NOTICE TO AIRMEN")) {
        addNote("Notice to Airmen information is included.")
    }

    if (allText.includes("CLSD")) {
        addNote("One or more runways or taxiways are closed.")
    }

    if (allText.includes("TWY")) {
        addNote("Taxiway information is included.")
    }

    if (allText.includes("WAKE TURBULENCE")) {
        addNote("Wake turbulence procedures or standards are mentioned.")
    }

    if (allText.includes("CRANE")) {
        addNote("Crane activity or obstruction information is mentioned.")
    }

    if (allText.includes("PUSHBACK")) {
        addNote("Pushback instructions are included.")
    }

    if (allText.includes("AIRCRAFT REQUESTED TO FOLLOW ATC INSTRUCTIONS")) {
        addNote("Aircraft are requested to follow ATC instructions strictly.")
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
    decodedStatus.textContent = ""
    copyStatus.textContent = ""
    exportStatus.textContent = ""
})

parseButton.addEventListener("click", function() {
    const inputText = rawAtis.value
    decodedStatus.textContent = ""
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

copyDecodedButton.addEventListener("click", function() {
    const decodedText = decodedOutput.textContent

    if (decodedText.trim() === "" || decodedText === "No decoded notes detected.") {
        decodedStatus.textContent = "No decoded notes to copy yet."
        return
    }

    navigator.clipboard.writeText(decodedText)
    decodedStatus.textContent = "Decoded notes copied."
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
        decodedStatus.textContent = ""
        copyStatus.textContent = ""
        exportStatus.textContent = ""
    })

    sampleButtonsContainer.appendChild(button)
}