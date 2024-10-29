# Serial Xterm - VS Code Extension

## Overview

**Serial Xterm** is a Visual Studio Code extension designed to facilitate communication with serial devices directly from your editor. It provides an integrated terminal with features such as transmit (TX), receive (RX), terminal clearing, and the ability to dump terminal output for further analysis.

![Serial Xterm](https://raw.githubusercontent.com/youkony/contents/main/serial-xterm.gif)

## Usage

1. **Open and close Serial Port**
   - To open serial port, use the `Connect` icon.
   - To close serial port, use the `Disconnect` icon.

2. **Transmit Data**
   - You can send data to the connected serial device by typing in the terminal.
   - Serial Xterm can send data by the command `serial-xterm.send` issued by other extensions. 
     (Example code) vscode.commands.executeCommand('serial-xterm.send', {type: 'tx', value: 'TX string'});

3. **Receive Data**
   - Incoming data from the connected serial device will be displayed in the terminal in real-time.
   - Serial Xterm can redirect the received data to an extension registered it's rx-callback command.
     (Example code) vscode.commands.executeCommand('serial-xterm.rx_callback', {rx-callback: 'xxxxxxx.serial-xterm.rx'});
                    When RX happens, Serial Xterm executes 'xxxxxxx.serial-xterm.rx' with the argument {type: 'rx', value: 'RX string'} 

4. **Clear Terminal**
   - To clear the terminal output, use the `Clear` icon.

5. **Dump Terminal Output**
   - To dump the current terminal session's output to an editor for the further analysis or logging purpose, use the `Dump` icon.

6. **Copy and Paste by L-Button Click**
   - You can copy the selected text by L-button click
   - You can paste/input the text in clipboard to terminal by L-button click.

7. **Word Hilighting**
   - You can register the words for hilighting in Tool menu
   - Serial Xterm displays the registered words with Red, Green, or Yellow color.


