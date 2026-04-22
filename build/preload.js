const { contextBridge, ipcMain } = require('electron');

// Helper to add event listener
const addListener = (channel, func) => {
  // Wrap the function to prevent the original function from being GC'd
  const wrappedFunc = (...args) => func(...args);
  ipcMain.on(channel, wrappedFunc);
  // Return a function to remove the listener
  return () => ipcMain.removeListener(channel, wrappedFunc);
};

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcMain.invoke('get-app-version'),
  addListener: addListener,
});
