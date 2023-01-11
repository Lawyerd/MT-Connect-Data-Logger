const axios = require('axios')
const xml2js = require('xml2js')
const {storeData} = require('./storeData')
const URL = 'http://192.168.10.120:5000/current'

async function getData(){
const response = await axios({
    url: URL, 
    method: 'get',
    headers: {
        'Accept': 'application/xml'
    }
  });

return (response.data)
}

async function parseXML(xml) {
    try {
        const result = await new Promise((resolve, reject) => {
            xml2js.parseString(xml, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        delete result.MTConnectStreams['$']
        return result.MTConnectStreams;
    } catch (error) {
        throw error;
    }
}




async function main(){
    const response = await getData()
    // console.log(response)
    try {
        const parsedXML = await parseXML(response)
        const Header = parsedXML.Header
        const DeviceStream = parsedXML.Streams[0]["DeviceStream"]
        // console.log(Header)
        // console.log(DeviceStream[0]['ComponentStream'][2]['Samples'])
        
        await storeData(parsedXML)
    } catch (error) {
        console.log(error);
    }
}

main()

