exports.getData = async function getData(URL) {
    const response = await fetch(URL, {
        method: 'GET',
        headers: {
            'Accept': 'application/xml'
        }
    });

    return response.text();
}