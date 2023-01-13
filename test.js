const {getData} = require("./function/getData")
const {parseXML} = require("./function/parseXML")
const { filterObject } = require('./function/filterObject')

const AGENT_URL = 'http://192.168.10.120:5000/current'

async function main(){

    const result = await getData(AGENT_URL)
    const parsedXML = await parseXML(result)
    const filterdDevices = filterObject(parsedXML)
    console.log(filterdDevices)

}
main()