const axios = require('axios')
const xml2js = require('xml2js')

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
        return result.MTConnectStreams;
    } catch (error) {
        throw error;
    }
}

exports.getData = async function getData(URL) {
    const response = await axios({
        url: URL,
        method: 'get',
        headers: {
            'Accept': 'application/xml'
        }
    });
    const parsedXML = await parseXML(response.data)
    return (parsedXML)
}
