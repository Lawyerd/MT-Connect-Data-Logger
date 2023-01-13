const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://junseok:jim1292@cluster0.vrtl2.mongodb.net/CNC_Monitoring'
mongoose.set('strictQuery', true);

let connection = null;

const connect = () => {
    if (connection && mongoose.connection.readyState === 1)
        return Promise.resolve(connection);
    return mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
        .then(conn => { connection = conn; return connection; });
};

const deviceSchema = new mongoose.Schema({
    _id:String,
    creationTime:String,
    lastSequence:String,
    Device: Object
});


exports.storeData = async function storeData(data) {
    await connect()

    const Header = data.Header[0]['$']
    const creationTime = Header.creationTime
    const lastSequence = Header.lastSequence
    const _id = Header.instanceId + lastSequence 
    console.log(_id)

    const deviceNumber = data["Streams"][0]['DeviceStream'].length
    for(let i=0; i<deviceNumber; i++){
        const device = data["Streams"][0]['DeviceStream'][i]
        const deviceName = device['$']['name']
        const deviceAvailability = device.ComponentStream[0].Events[0].Availability[0]['_']
        console.log(deviceName, deviceAvailability)
        if(deviceAvailability=='UNAVAILABLE'){
            continue;
        }
        const COLLECTION_NAME = deviceName
        const deviceModel = mongoose.model(COLLECTION_NAME, deviceSchema);
        const storedData = new deviceModel({ _id:_id, creationTime:creationTime, lastSequence: lastSequence, Device: device });

        await storedData.save((error) => {
            if (error) {
                console.log("ERROR!")
                return(error)
            } else {
                // resolve(storedData);
                console.log("SAVED!")
            }
        });
    }
    // await mongoose.disconnect();
}

