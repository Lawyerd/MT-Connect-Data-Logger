exports.determineAction = (currentState, previousState, currentBlock) => {
    let shouldSave = false;
    let isStart = false;
    let isFinished = false;
    let isRunning = false;
    let shouldPostMessage = false;
  
    // If the current state is 'ACTIVE'
    if (currentState === 'ACTIVE') {
      // If the previous state was not 'ACTIVE', the machine just started running
      if (previousState !== 'ACTIVE') {
        isStart = true;
      } 
      // If the previous state was also 'ACTIVE', the machine is still running
      else {
        isRunning = true;
        shouldSave = true;
      }
    } 
    // If the current state is not 'ACTIVE' and the previous state was 'ACTIVE',
    // the machine just changed from running to another state
    else if (previousState === 'ACTIVE') {
      // When only encounter M1 or M30 block, Post message
      if(currentBlock.includes('M1') || currentBlock.includes('M30') || currentBlock.includes('O')){
        shouldPostMessage = true;
        if(currentBlock.includes('O')){
          isFinished = true
        }
      }
    } 
    // If the current state is different from the previous state, 
    // the machine just changed to a different state
    else if (currentState !== previousState) {
      shouldSave = true;
    }
    return [shouldSave, isStart, isRunning, isFinished, shouldPostMessage];
  }