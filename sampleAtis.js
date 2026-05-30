const sampleAtis = [
    {
        label: "Clean ATIS",
        text: `Dubai Information Bravo. Runway 30 left. Wind 310 degrees at 12 knots. Visibility 5000 meters. QNH 1013. Temperature 22. Dewpoint 10. Transition level 60.`
    },
    {
        label: "Full parser demo",
        text: `Dubai information bravo observation 1150 zulu runway 30 left wind 310 degrees at 12 knots visibility 5 kilometers clouds scattered 2500 feet altimeter 2992 temperature 22 dew point 10 transition level 60 remarks bird activity near airport`
    },
    {
        label: "Full stress test",
        text: `DUBAI    INFORMATION   BRAVO.

Observation   1150   zulu.

Runway   30 left.
Wind   310 degrees at 12 knots.
Visibility   5 kilometers.
Clouds   scattered 2500 feet.
Altimeter   2992.
Temperature   22.
Dew point   10.
Transition   level   60.
Remarks   bird activity near airport.`
    },
    {
        label: "Arrival ATIS notes",
        text: `OMAA ARR ATIS J
0527Z
ILS APP / LDG 31R
WIND 290 05 KT / WIND DIR 240 V 330
CAVOK
T 37 / DP 09
QNH 1005
NOSIG
PARALLEL RWY OPERATION IN PROGRESS
ABU DHABI APCH FREQ IS 1 2 4 . 4
MINIMIZE RWY OCCUPANCY TIMES
AFT RECEIVING TAXI INSTRUCTIONS FROM ATC
WHEN VACATING RWY PILOTS SHALL CONTINUE
TAXIING WITHOUT DELAY TO THE CLR LIMIT
WITHOUT STOPPING
ON FIRST CONTACT STATE AC TYPE
RECEIVING INFO J`
    },
    {
        label: "Departure ATIS notes",
        text: `OMDB DEP ATIS K
1420Z
DEP RWY 30R
WIND 310 12 KT
VIS 8000 M
T 34 / DP 18
QNH 1008
NOSIG
CONTACT DUBAI DELIVERY FREQ 1 2 1 . 9
ON FIRST CONTACT STATE AC TYPE
RECEIVING INFO K`
    },
    {
        label: "Known runway limitation",
        text: `Dubai information echo landing runway 30 left departing runway 30 right wind 310 degrees at 12 knots visibility 5000 meters qnh 1013 temperature 22 dewpoint 10 transition level 60`
    },
    {
        label: "Missing fields",
        text: `Dubai runway 30 left wind 310 degrees at 12 knots qnh 1013`
    },
    {
        label: "Compact ATIS notes",
        text: `SBSJ ARR ATIS G
    1402Z EXPECT ILS T RWY16
    RSCD 14:00Z BRAKING CONDITIONS NOT REPORTED
    MUM TYPE OF DEPOSIT NOT REPORTED
    ALS INOP
    TRL FL085
    WIND 240/02KT
    VIS 6000M
    CLD SCT040 OVC070
    T20 / DP18
    QNH 1021HPA
    BIRDS
    END OF ATIS G`
    }
]