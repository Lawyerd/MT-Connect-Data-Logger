const xml2js = require('xml2js')
const chalk = require('chalk');

exports.getStreamData = async (URL) => {
    const response = await fetch(URL, {
        method: 'GET',
        headers: {
            'Accept': 'application/xml'
        }
    });
    const xml = await response.text()
    const result = await parseXML(xml);
    return result
}


async function parseXML(xml) {
    try {
        const result = await new Promise((resolve, reject) => {
            xml2js.parseString(xml, (error, result) => {
                if (error) {
                    console.error(chalk`{red [Error]} ${error}`);
                    reject(error);
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