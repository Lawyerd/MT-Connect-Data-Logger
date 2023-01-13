const xml2js = require('xml2js')

exports.parseXML = async function parseXML(xml) {
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