
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

      const ascii = data.charCodeAt(0);
      const ch = (31 < ascii && ascii <  127) ? data : '';

      let cmd = term.buffer.active.getLine(term.buffer.active.cursorY).translateToString(false);

      const history_1 = document.getElementById('history1');
      const history_2 = document.getElementById('history2');
      const history_3 = document.getElementById('history3');
      history_1.value = cmd + ch;  
      history_2.value = cmd + ch;
      history_3.value = cmd + ch; 

      vscode.postMessage({
        type: 'cmd',
        value: cmd + ch
      });
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
