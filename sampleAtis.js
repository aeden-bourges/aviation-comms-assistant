const sampleAtis = [
    {
        label: "Clean Dubai ATIS",
        text: `Dubai Information Bravo. Runway 30 left. Wind 310 degrees at 12 knots. Visibility 5000 meters. QNH 1013. Temperature 22. Dewpoint 10. Transition level 60.`
    },
    {
        label: "Mixed capitalization",
        text: `DUBAI information bravo runway 30 left wind 310 degrees at 12 knots visibility 5000 meters qnh 1013 temperature 22 dewpoint 10 transition level 60`
    },
    {
        label: "Line breaks and spacing",
        text: `Dubai    Information   Charlie
Runway 30 left
Wind 310 degrees at 12 knots
Visibility 5000 meters
QNH 1013
Temperature 22
Dewpoint 10
Transition level 60`
    },
    {
        label: "Runway 30L format",
        text: `Dubai information delta runway 30L wind 310 at 12 knots visibility 5000 meters qnh 1013 temperature 22 dewpoint 10 transition level 60`
    },
    {
        label: "Known runway limitation",
        text: `Dubai information echo landing runway 30 left departing runway 30 right wind 310 degrees at 12 knots visibility 5000 meters qnh 1013 temperature 22 dewpoint 10 transition level 60`
    },
    {
        label: "Missing information keyword",
        text: `Dubai runway 30 left wind 310 degrees at 12 knots qnh 1013`
    },
    {
        label: "Invalid ATIS identifier",
        text: `Dubai information runway 30 left wind 310 degrees at 12 knots qnh 1013`
    },
    {
        label: "Alfa spelling",
        text: `Dubai information alfa runway 30 left wind 310 degrees at 12 knots qnh 1013`
    },
    {
        label: "Missing QNH value",
        text: `Dubai information bravo runway 30 left wind 310 degrees at 12 knots qnh`
    },
    {
        label: "Dew point two words",
        text: `Dubai information bravo runway 30 left wind 310 degrees at 12 knots visibility 5000 meters qnh 1013 temperature 22 dew point 10 transition level 60`
    },
]