const axios = require('axios')


exports.getData = async function getData(URL) {
    const response = await axios({
        url: URL,
        method: 'get',
        headers: {
            'Accept': 'application/xml'
        }
    });
    
    return (response.data)
}
