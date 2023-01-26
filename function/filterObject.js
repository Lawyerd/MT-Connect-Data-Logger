exports.filterObject = function filterObject(data, deviceInfo) {
    let result = []

    // console.log(data)
    const Header = data.Header[0]['$']
    const Devices = data.Streams[0].DeviceStream
    const devicesNumber = deviceInfo.length
    const creationTime = Header.creationTime
    const lastSequence = Header.lastSequence
    const instanceId = Header.instanceId
    const saveTime = new Date()
    let state = "OFF"
    const _id = Date.now() + '-' + lastSequence

    for (let i = 0; i < devicesNumber; i++) {
        let filterdObject = {}

        filterdObject._id = _id
        filterdObject.creationTime = creationTime
        filterdObject.lastSequence = lastSequence
        filterdObject.saveTime = saveTime
        filterdObject.state = state
        filterdObject.instanceId = instanceId

        const Device = Devices.find(device => device["$"].name === deviceInfo[i].adapter);
        filterdObject.deviceName = deviceInfo[i].device

        const deviceAvailability = Device.ComponentStream[0].Events[0].Availability[0]['_']
        if (deviceAvailability != 'AVAILABLE') {
            filterdObject.state = "OFF"
            filterdObject.Device = {}
            filterdObject.Device.name = Device["$"].name
            result.push(filterdObject)
            continue;
        }

        filterdObject.Device = {}
        filterdObject.Device.name = Device["$"].name

        filterdObject.Device.Components = []
        // result.Device.Components[0] = 

        const componentDevice = Device.ComponentStream.find(component => component['$']['component'] == 'Device')
        const componentController = Device.ComponentStream.find(component => component['$']['component'] == 'Controller')
        const componentPath = Device.ComponentStream.find(component => component['$']['component'] == 'Path')
        const componentRotary_A = Device.ComponentStream.find(component => component['$']['component'] == 'Rotary' && component['$']['name'] == 'A')
        const componentRotary_C = Device.ComponentStream.find(component => component['$']['component'] == 'Rotary' && component['$']['name'] == 'C')
        const componentLinear_X = Device.ComponentStream.find(component => component['$']['component'] == 'Linear' && component['$']['name'] == 'X')
        const componentLinear_Y = Device.ComponentStream.find(component => component['$']['component'] == 'Linear' && component['$']['name'] == 'Y')
        const componentLinear_Z = Device.ComponentStream.find(component => component['$']['component'] == 'Linear' && component['$']['name'] == 'Z')


        const newComponentDevice = {
            name: componentDevice['$']['component'],
            Events: {
                asset_chg: componentDevice['Events'][0]['AssetChanged'][0]['_'],
                asset_rem: componentDevice['Events'][0]['AssetRemoved'][0]['_'],
                avail: componentDevice['Events'][0]['Availability'][0]['_']
            }
        }

        const componentControllerConditionComms = componentController['Condition'][0]['Normal'].find(element => element['$']['name'] == 'comms')
        const componentControllerConditionLogic = componentController['Condition'][0]['Normal'].find(element => element['$']['name'] == 'logic')
        const componentControllerConditionMotion = componentController['Condition'][0]['Normal'].find(element => element['$']['name'] == 'motion')
        const componentControllerConditionServo = componentController['Condition'][0]['Normal'].find(element => element['$']['name'] == 'servo')
        const componentControllerConditionSystem = componentController['Condition'][0]['Normal'].find(element => element['$']['name'] == 'system')



        const newComponentController = {
            name: componentController['$']['component'],
            Events: {
                estop: componentController['Events'][0]['EmergencyStop'][0]['_'],
                message: componentController['Events'][0]['Message'][0]['_']
            },
            Condition: {
                // comms: componentControllerConditionComms['$']['type'],
                // logic: componentControllerConditionLogic['$']['type'],
                // motion: componentControllerConditionMotion['$']['type'],
                // servo: componentControllerConditionServo['$']['type'],
                // system: componentControllerConditionSystem['$']['type'],
            }
        }

        // const componentPathSamplesFeedCommanded= componentPath['Samples'][0]['PathFeedrate'].find(element => element['$']['name']=='feed_commanded')
        // const componentPathSamplesFeedOver= componentPath['Samples'][0]['PathFeedrate'].find(element => element['$']['name']=='feed_ovr')
        const componentPathSamplesPathFeedrate = componentPath['Samples'][0]['PathFeedrate'].find(element => element['$']['name'] == 'path_feedrate')
        const componentPathSamplesPathPosition = componentPath['Samples'][0]['PathPosition'].find(element => element['$']['name'] == 'path_position')
        const componentPathEvents = componentPath['Events'][0]
        // const componentPathEventPathPosition= componentPath['Samples'][0]['PathPosition'].find(element => element['$']['name']=='path_position')
        
        filterdObject.state = componentPathEvents['Execution'][0]['_']

        const newComponentPath = {
            name: componentPath['$']['component'],
            Samples: {
                // feed_commanded:"UNAVAILABLE",
                // feed_ovr:"UNAVAILABLE",
                path_feedrate: Number(componentPathSamplesPathFeedrate['_']),
                path_position: componentPathSamplesPathPosition['_'].split(' ').map(x => parseFloat(x))
            },
            Events: {
                active_axes: componentPathEvents['ActiveAxes'][0]['_'].split(' '),
                block: componentPathEvents['Block'][0]['_'],
                execution: componentPathEvents['Execution'][0]['_'],
                line: Number(componentPathEvents['Line'][0]['_']),
                // mode:componentPathEvents['Mode'][0]['_'],
                part_count: Number(componentPathEvents['PartCount'][0]['_']),
                program: Number(componentPathEvents['Program'][0]['_']),
                program_comment: componentPathEvents['ProgramComment'][0]['_'],
                tool_id: Number(componentPathEvents['ToolId'][0]['_'])
            }

        }


        // Condition이 Device의 Rotary_A 사용 유무에 따라 Normal과 Unavailable 두 가지 경우로 나눠지고, 쓸만한 데이터가 아닌 것 같아 제외 
        // const componentRotary_AConditionAoverheat= componentRotary_A['Condition'][0]['Normal'].find(element => element['$']['name']=='Aoverheat')
        // const componentRotary_AConditionAservo= componentRotary_A['Condition'][0]['Normal'].find(element => element['$']['name']=='Aservo')
        // const componentRotary_AConditionAtravel= componentRotary_A['Condition'][0]['Normal'].find(element => element['$']['name']=='Atravel')

        const newComponentRotary_A = {
            name: componentRotary_A['$']['component'] + '_' + componentRotary_A['$']['name'],
            Samples: {
                Aact: Number(componentRotary_A['Samples'][0]['Angle'][0]['_']),
                Aload: Number(componentRotary_A['Samples'][0]['Load'][0]['_']),
            },
            Events: {
                arotarymode: componentRotary_A['Events'][0]['RotaryMode'][0]['_']
            },
            Condition: {
                // Aoverheat: componentRotary_AConditionAoverheat['$']['type'],
                // Aservo:componentRotary_AConditionAservo['$']['type'],
                // Atravel:componentRotary_AConditionAtravel['$']['type']
            }
        }

        const componentRotary_CConditionS1servo= componentRotary_C['Condition'][0]['Normal'].find(element => element['$']['name']=='S1servo')


        const newComponentRotary_C = {
            name: componentRotary_C['$']['component'] + '_' + componentRotary_C['$']['name'],
            Samples: {
                S1load: Number(componentRotary_C['Samples'][0]['Load'][0]['_']),
                S1speed: Number(componentRotary_C['Samples'][0]['RotaryVelocity'][0]['_']),
                SspeedOvr: Number(componentRotary_C['Samples'][0]['RotaryVelocity'][1]['_']),
            },
            Events: {
                crotarymode: componentRotary_C['Events'][0]['RotaryMode'][0]['_']
            },
            Condition: {
                // S1servo: componentRotary_CConditionS1servo['$']['type']
            }
        }

        const componentLinear_XConditionXoverheat= componentLinear_X['Condition'][0]['Normal'].find(element => element['$']['name']=='Xoverheat')
        const componentLinear_XConditionXservo= componentLinear_X['Condition'][0]['Normal'].find(element => element['$']['name']=='Xservo')
        const componentLinear_XConditionXtravel= componentLinear_X['Condition'][0]['Normal'].find(element => element['$']['name']=='Xtravel')


        const newComponentLinear_X = {
            name: componentLinear_X['$']['component'] + '_' + componentLinear_X['$']['name'],
            Samples:{
                Xact:Number(componentLinear_X['Samples'][0]['Position'][0]['_']),
                Xload:Number(componentLinear_X['Samples'][0]['Load'][0]['_']),
            },
            Condition:{
                // Xoverheat:componentLinear_XConditionXoverheat['$']['type'],
                // Xservo:componentLinear_XConditionXservo['$']['type'],
                // Xtravel:componentLinear_XConditionXtravel['$']['type'],
            }
        }

        const componentLinear_YConditionYoverheat= componentLinear_Y['Condition'][0]['Normal'].find(element => element['$']['name']=='Yoverheat')
        const componentLinear_YConditionYservo= componentLinear_Y['Condition'][0]['Normal'].find(element => element['$']['name']=='Yservo')
        const componentLinear_YConditionYtravel= componentLinear_Y['Condition'][0]['Normal'].find(element => element['$']['name']=='Ytravel')


        const newComponentLinear_Y = {
            name: componentLinear_Y['$']['component'] + '_' + componentLinear_Y['$']['name'],
            Samples:{
                Yact:Number(componentLinear_Y['Samples'][0]['Position'][0]['_']),
                Yload:Number(componentLinear_Y['Samples'][0]['Load'][0]['_']),
            },
            Condition:{
                // Yoverheat:componentLinear_YConditionYoverheat['$']['type'],
                // Yservo:componentLinear_YConditionYservo['$']['type'],
                // Ytravel:componentLinear_YConditionYtravel['$']['type'],
            }
        }

        const componentLinear_ZConditionZoverheat= componentLinear_Z['Condition'][0]['Normal'].find(element => element['$']['name']=='Zoverheat')
        const componentLinear_ZConditionZservo= componentLinear_Z['Condition'][0]['Normal'].find(element => element['$']['name']=='Zservo')
        const componentLinear_ZConditionZtravel= componentLinear_Z['Condition'][0]['Normal'].find(element => element['$']['name']=='Ztravel')


        const newComponentLinear_Z = {
            name: componentLinear_Z['$']['component'] + '_' + componentLinear_Z['$']['name'],
            Samples:{
                Zact:Number(componentLinear_Z['Samples'][0]['Position'][0]['_']),
                Zload:Number(componentLinear_Z['Samples'][0]['Load'][0]['_']),
            },
            Condition:{
                // Zoverheat:componentLinear_ZConditionZoverheat['$']['type'],
                // Zservo:componentLinear_ZConditionZservo['$']['type'],
                // Ztravel:componentLinear_ZConditionZtravel['$']['type'],
            }
        }

        filterdObject.Device.Components = [newComponentDevice,newComponentController,newComponentPath,newComponentRotary_A,newComponentRotary_C, newComponentLinear_X,newComponentLinear_Y,newComponentLinear_Z]
        result.push(filterdObject)
    }
    return result
}