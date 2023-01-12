const axios = require('axios')
const xml2js = require('xml2js')
const mongoose = require('mongoose');
const {filterObject} = require('./filterObject')
const AGENT_URL = 'http://192.168.10.120:5000/current'
const MONGODB_URI = 'mongodb+srv://junseok:jim1292@cluster0.vrtl2.mongodb.net/CNC_Monitoring'
mongoose.set('strictQuery', true);



async function getData() {
    const response = await axios({
        url: AGENT_URL,
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
        return result.MTConnectStreams;
    } catch (error) {
        throw error;
    }
}

let connection = null;

const connect = () => {
    if (connection && mongoose.connection.readyState === 1)
        return Promise.resolve(connection);
    return mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
        .then(conn => { connection = conn; return connection; });
};

const deviceSchema = new mongoose.Schema({
    _id: String,
    creationTime: String,
    lastSequence: String,
    Device: Object
});


async function main() {
    await connect()
    setInterval(async () => {
        try {
            const response = await getData()
            try {
                const parsedXML = await parseXML(response)
                const filterdDevices = filterObject(parsedXML)
                const deviceNumber = filterdDevices.length
                for (let i = 0; i < deviceNumber; i++) {
                    const COLLECTION_NAME = filterdDevices[i]['Device']['name']
                    const deviceModel = mongoose.model(COLLECTION_NAME, deviceSchema);
                    const storedData = new deviceModel(filterdDevices[i]);

                    await storedData.save((error) => {
                        if (error) {
                            throw(error)
                        } 
                    });
                }
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        }
    }, 1000);

}

main()