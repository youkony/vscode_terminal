
let term;
let vscode;

/**
 * @param {{ innerWidth: number; innerHeight: number; }} win
 */

let lineBuffer = '';
let latestValue = 0;
let encoder;
let fit;

async function serialWrite(data) {
	encoder = new TextEncoder();
	const dataArrayBuffer = encoder.encode(data);
  vscode.postMessage({
    type: 'stdin',
    value: dataArrayBuffer
  });
}

let copied = ''; 
function paste() {
  if(term.hasSelection() == true) {
    copied = term.getSelection();
    term.clearSelection();
    vscode.postMessage({
      type: 'copy',
      value: copied
    });
  }
  serialWrite(copied);
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
            term.write('\x1b[31mConnected success !\x1b[m\r\n');
          } else {
            term.write('\x1b[31m\r\nDisconnected !\x1b[m\r\n');
          }
          break;
        case 'stdout':
          if (message.value) {
            term.write(message.value);
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
