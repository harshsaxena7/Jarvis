const { ipcRenderer } = require('electron');

window.electronAPI = {
    moveMouse: (coords) => ipcRenderer.invoke('mouse:move', coords),
    clickMouse: () => ipcRenderer.invoke('mouse:click'),
    triggerAgent: (gesture) => ipcRenderer.invoke('agent:trigger', gesture)
};
