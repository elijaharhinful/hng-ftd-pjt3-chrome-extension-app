document.addEventListener("DOMContentLoaded", ()=>{
    // GET THE SELECTORS OF THE BUTTONS
    const startVideoButton = document.getElementById("start_video")
    const stopVideoButton = document.getElementById("stop_video")

    // adding event listeners
    // this piece of code listens for the click event on the start recording button
    //it then asks the user for permissions to screen record or determine which specific tab or window to record
    // if  is successful it sends the content.js to use as a confirmation to record the scree
    startVideoButton.addEventListener("click", ()=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "request_recording"},  function(response){
                if(!chrome.runtime.lastError){
                    console.log(response)
                } else{
                    console.log(chrome.runtime.lastError, 'error line 14')
                }
            })
        } )
    })

    //if the user clicks on the stop-video button 
    // send a "stop video" message to the content.js to use as confirmation to stop the recording
    stopVideoButton.addEventListener("click", ()=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "stopvideo"},  function(response){
                if(!chrome.runtime.lastError){
                    console.log(response)
                } else{
                    console.log(chrome.runtime.lastError, 'error line 27')
                }
            })
        } )
    })
})