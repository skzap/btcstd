const gdpWorld = 80934771028340
const populationWorld = 7674000000
let countries = {}

loadBitcoinPrice()

function loadBitcoinPrice() {
    let xobj = new XMLHttpRequest()
    xobj.overrideMimeType("application/json")
    xobj.open('GET', 'https://blockchain.info/ticker', true)
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            btcToDollar = JSON.parse(xobj.responseText).USD["15m"]
            loadCountries()
        } 
    }
    xobj.send(null)
}

function loadCountries() {
    let xobj = new XMLHttpRequest()
    xobj.overrideMimeType("application/json")
    xobj.open('GET', 'countries.json', true)
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            countries = JSON.parse(xobj.responseText)
            drawMap()
        }
            
    }
    xobj.send(null)
}

function drawMap() {
    let gdpTotal = 0
    let popTotal = 0
    let countriesTotal = 0
    let newCountry = {
        date_effective: '4 Jan 2009'
    }
    let nextCountry = {
        date_effective: '4 Jan 2009',
        name: "N/A",
        flag: "🏴‍☠️"
    }
    for (const code in countries) {
        if (countries[code].gdp_dollar)
            countries[code].gdp_btc = Math.round(countries[code].gdp_dollar / btcToDollar)

        if (countries[code].link)
            countries[code].linkTarget = '_blank'

        let now = Date.now()
        let enacted = Date.parse(countries[code].date_enacted)
        let effective = Date.parse(countries[code].date_effective)

        if (effective < now) {
            countries[code].color = 'green'
            countriesTotal++
            popTotal += countries[code].population
            gdpTotal += countries[code].gdp_btc
        } else {
            countries[code].color = 'lightgreen'
        }

        if (effective < now && effective > Date.parse(newCountry.date_effective))
            newCountry = countries[code]

        if (now < effective && effective < Date.parse(nextCountry.date_effective))
            nextCountry = countries[code]
    }

    console.log(countries)

    gdpPerc.innerHTML = (100*btcToDollar*gdpTotal/gdpWorld).toFixed(2)
    gdpTot.innerHTML = gdpTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    popPerc.innerHTML = (100*popTotal/populationWorld).toFixed(2)
    popTot.innerHTML = popTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    totalC.innerHTML = countriesTotal
    newC.innerHTML = newCountry.name+" "+newCountry.flag
    nextC.innerHTML = nextCountry.name+" "+nextCountry.flag


    new svgMap({
        targetElementID: 'svgMap',
        flagType: 'emoji',
        noDataText: 'No information',
        maxZoom: 10,
        zoomScaleSensitivity:  0.4,
        colorNoData: 'gainsboro',
        data: {
            data: {
                color: {
                    name: '',
                    format: ' '
                },
                date_enacted: {
                    name: 'Enacted',
                },
                date_effective: {
                    name: 'Effective',
                },
                population: {
                    name: 'Population',
                    thousandSeparator: ',',
                },
                gdp_btc: {
                    name: 'GDP',
                    format: '{0} BTC',
                    thousandSeparator: ',',
                }
            },
            applyData: 'color',
            values: countries
        }
    })

    document.getElementsByClassName('svgMap-map-wrapper')[0].style.background = 'none'
}

