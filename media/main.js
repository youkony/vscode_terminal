
let term;
let vscode;

/**
 * @param {{ innerWidth: number; innerHeight: number; }} win
 */

let lineBuffer = '';
let latestValue = 0;
let encoder;
let fit;

let hilight_en;
let hilight_red;
let hilight_green;
let hilight_yellow;

let regExp_red;
let regExp_yellow;
let regExp_green;

async function serialWrite(data) {
	encoder = new TextEncoder();
	const dataArrayBuffer = encoder.encode(data);
  vscode.postMessage({
    type: 'tx',
    value: dataArrayBuffer
  });
}

let selectedText = ''; 
function paste() {
  if(term.hasSelection() == true) {
    selectedText = term.getSelection();
    term.clearSelection();
    vscode.postMessage({
      type: 'ctrl_c',
      value: selectedText
    });
  } else {
    vscode.postMessage({
      type: 'ctrl_v',
    });
  }
  return false;
}

(function () {
  window.onload = function() {
    // @ts-ignore
    term = new Terminal({
      cols: 120,
      rows: 40
    });

    term.onData(function (data){
      serialWrite(data);
    });

    // @ts-ignore
    //fit = new FitAddon();
    //term.loadAddon(fit);

    const termId = document.getElementById("terminal");
    if(termId !== null) {
      term.open(termId);
    }
  };

  // @ts-ignore
  vscode = acquireVsCodeApi();
  const oldState = vscode.getState() || {};
  window.addEventListener('message', event => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case 'connected':
          if (message.value) {
            term.write('\x1b[1;32mConnected !\x1b[m\r\n');
          } else {
            term.write('\x1b[1;31m\r\nDisconnected !\x1b[m\r\n');
          }
          break;
        case 'rx':
          if (message.value) {
            lineBuffer += message.value;
            term.write(message.value);
            if(message.value.includes('\n')) {
              if(hilight_en == true && regExp_red.test(lineBuffer)) {
                term.write('\x1b[2K'); // Clear the entire line
                term.write('\x1b[G');  // Move cursor to the beginning of the line      
                term.write('\x1b[31m'); // text color is red
                term.write(lineBuffer);
                term.write('\x1b[m'); // text color is reset              
              } else if(regExp_yellow.test(lineBuffer)) {
                term.write('\x1b[2K'); // Clear the entire line
                term.write('\x1b[G');  // Move cursor to the beginning of the line      
                term.write('\x1b[33m'); // text color is yellow
                term.write(lineBuffer);
                term.write('\x1b[m'); // text color is reset              
              } else if(regExp_green.test(lineBuffer)) {
                term.write('\x1b[2K'); // Clear the entire line
                term.write('\x1b[G');  // Move cursor to the beginning of the line      
                term.write('\x1b[32m'); // text color is green
                term.write(lineBuffer);
                term.write('\x1b[m'); // text color is reset              
              }

              lineBuffer = '';
            }
          }
          break;
        case 'clear':
          term.reset();
          break;
        case 'dump':
          term.selectAll();
          const buf = term.getSelection();
          term.clearSelection();
          vscode.postMessage({
            type: 'dump',
            value: buf
          });
          break;
         default:
          break;
      }
  });
}());
