// Preload script para comunicación segura entre Electron y la webapp
// Por ahora no expone ninguna API, pero está listo para futuras extensiones

const { contextBridge } = require('electron');

// Si en el futuro necesitas exponer APIs de Node.js a la webapp:
// contextBridge.exposeInMainWorld('api', {
//   // Tus funciones seguras aquí
// });

console.log('Electron preload script loaded');
