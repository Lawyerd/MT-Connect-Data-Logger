// const fs = require('fs');
// exports.getDevices = function getDevices() {
//     return new Promise((resolve, reject) => {
//         fs.readFile('./db/DEVICES.txt', 'utf-8', (err, data) => {
//             if (err) reject(err);

//             let jsonObjectArray = JSON.parse(data);
//             resolve(jsonObjectArray);
//         });
//     });
// }

const axios = require('axios')
const URL = 'https://0zd9p9qiuf.execute-api.ap-northeast-2.amazonaws.com/default/NotionReader?plantNumber='
exports.getDevices = async function getDevices(plantNumber) {
    return axios.get(URL + String(plantNumber))
        .then((response) => {
            const results = response.data.results;
            const filterdResult = filterMachinelist(results)
            return (filterdResult)
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};

const filterMachinelist = (rawArray) => {
    let machineList = Array(rawArray.length)
    for (let i = 0; i < rawArray.length; i++) {
        let machine = {}
        machine.id = rawArray[i].id
        machine.name = rawArray[i].properties.name.title[0].text.content
        machine.plant = rawArray[i].properties.plant.select.name
        machine.adapter = rawArray[i].properties.adapter.rich_text[0].text.content
        machine.host = rawArray[i].properties.host.rich_text[0].text.content
        machineList.push(machine)
    }
    machineList = machineList.filter(item => item !== "");
    return machineList
}