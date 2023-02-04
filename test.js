const {getData} = require("./function/getData")
const {parseXML} = require("./function/parseXML")
const { filterObject } = require('./function/filterObject')
// process.env.TXT_FILE_PATH = 'path/to/file/txt'
const {getDevices} = require("./function/getDevices")

const AGENT_URL = 'http://192.168.10.120:5000/current'

async function main(){

    // const result = await getData(AGENT_URL)
    // const parsedXML = await parseXML(result)
    // const filterdDevices = filterObject(parsedXML)
    // console.log(filterdDevices)
    // console.log(TXT_FILE_PATH)
    console.log(a)
}
main()