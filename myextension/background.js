
let id = null;
let tabid = null;
let element = null;
const connections = {};

function toggleSelector() {
  console.log("toggle");
}

// opens side panel when extension is clicked
// chrome.sidePanel
//   .setPanelBehavior({ openPanelOnActionClick: true })
//   .catch((error) => console.error(error));

// recieve and handle messages from content here
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (sender.tab) {
      console.log("background got msg from content");

      // content script sent over a DOM element
      if (request.type == 'element') {
        console.log("background got %O from content", JSON.stringify(request));

        // devtools is also configured to recieve this message
        // background will send this to server
        // so we use a POST req specifying JSON data
        // fetch(serverhost, {
        //   method: 'POST',
        //   headers: {
        //     'Content-type': 'application/JSON',
        //   },
        //   body: JSON.stringify(
        //     request
        //   )
        // }).then(response => {
        //   console.log(response);
        // });
      }
    }
  }
);

// recieve and handle messages from devtools here
chrome.runtime.onConnect.addListener(
  function(devtoolsConnection) {
    var devtoolsListener = function(msg, sender, sendResponse) {
      
      // get active tab
      if (msg.name == 'newTab') {
        id = msg.tabId;
        // connections to devtools require port
        connections[id] = devtoolsConnection;
        connections[id].postMessage("connected");
      }

      if (msg.name == 'selectToggle') {
        console.log("background got the select button");
        console.log("got msg %O from devtools", msg);

        (async () => {
          const response = await chrome.tabs.sendMessage(msg.tabId, {
            name: msg.name,
            set: msg.set,
            type: msg.type,
          });
          console.log(response);
        })();
      }
    }

    devtoolsConnection.onMessage.addListener(devtoolsListener);

    devtoolsConnection.onDisconnect.addListener(
      function() {
        devtoolsConnection.onMessage.removeListener(devtoolsListener);
      });
  }
);