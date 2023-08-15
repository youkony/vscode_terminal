
let term;
let vscode;

/**
 * @param {{ innerWidth: number; innerHeight: number; }} win
 */
function calculateSize(win) {
  var cols = Math.max(60, Math.min(150, (win.innerWidth) / 7)) | 0;
  var rows = Math.max(10, Math.min(80, (win.innerHeight - 40) / 12)) | 0;
  return [cols, rows];
}

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
    //var size = calculateSize(self);
    // @ts-ignore
    term = new Terminal({
      cols: 120,
      rows: 40
    });

    term.onData(function (data){
      serialWrite(data);

      let cmd = term.buffer.active.getLine(term.buffer.active.cursorY).translateToString(false);
      const ascii = data.charCodeAt(0);
      if( 31 < ascii && ascii <  127) {
        cmd = cmd + data; // ? 
      }

      const history_1 = document.getElementById('history1');
      const history_2 = document.getElementById('history2');
      const history_3 = document.getElementById('history3');
      history_1.value = cmd; 
      history_2.value = cmd; 
      history_3.value = cmd; 

      vscode.postMessage({
        type: 'cmd',
        value: cmd
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
