const https = require('https');
exports.readDevicesFromAWS = function readDevicesFromAWS(plantNumber) {
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
  let machineList = []
    for (let rewMachine of rawArray) {
        let machine = {}
        machine.id = rewMachine.id
        machine.name = rewMachine.properties.name.title[0].text.content
        machine.plant = rewMachine.properties.plant.select.name
        machine.adapter = rewMachine.properties.adapter.rich_text[0].text.content
        machine.host = rewMachine.properties.host.rich_text[0].text.content
        machineList.push(machine)
    }
    machineList = machineList.filter(item => item !== "");
    return machineList
}