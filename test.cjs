console.log('ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE);
console.log('Electron version:', process.versions.electron);
try {
  const electron = require('electron');
  console.log('Electron type:', typeof electron);
  if (typeof electron === 'string') {
    console.log('Electron string:', electron);
  }
} catch (e) {
  console.error(e);
}
