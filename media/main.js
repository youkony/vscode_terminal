
let term;
let vscode;

/**
 * @param {{ innerWidth: number; innerHeight: number; }} win
 */

let wordBuffer = '';
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
      rows: 40,
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
            for( let i = 0; i < message.value.length; i++) {
              if( hilight_en ) {
                wordBuffer += message.value[i];
                if(/\s/.test(wordBuffer)) {   // check the space, cr, lf .. 
                  wordBuffer = wordBuffer.substring(0, wordBuffer.length - 1);
                  const moves = wordBuffer.length;
                  if(regExp_red.test(wordBuffer)) {
                    term.write('\x1b[' + moves + 'D');  // move cursor backword
                    term.write('\x1b[1;31m'); // red color
                    term.write(wordBuffer); 
                    term.write('\x1b[m'); // reset color
                  } else if(regExp_yellow.test(wordBuffer)) {
                    term.write('\x1b[' + moves + 'D');  // move cursor backword
                    term.write('\x1b[1;33m'); // yellow color
                    term.write(wordBuffer); 
                    term.write('\x1b[m'); // reset color
                  } else if(regExp_green.test(wordBuffer)) {
                    term.write('\x1b[' + moves + 'D');  // move cursor backword
                    term.write('\x1b[1;32m'); // green color
                    term.write(wordBuffer); 
                    term.write('\x1b[m'); // reset color
                  }
                  wordBuffer = '';
                }
              }
              term.write(message.value[i]); 
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
