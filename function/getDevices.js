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

const https = require('https');
exports.getDevices = function getDevices(plantNumber) {
    return new Promise((resolve, reject) => {
      const URL = 'https://0zd9p9qiuf.execute-api.ap-northeast-2.amazonaws.com/default/NotionReader?plantNumber=';
      https.get(URL + String(plantNumber), (res) => {
        let data = '';
  
        res.on('data', (chunk) => {
          data += chunk;
        });
  
        res.on('end', () => {
          try {
            const responseData = JSON.parse(data);
            const results = responseData.results;
            const filteredResult = filterMachinelist(results);
            resolve(filteredResult);
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  };
const filterMachinelist = (rawArray) => {
    console.log(rawArray)
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