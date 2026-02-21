// Polyfill for browser environment
if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof __dirname === 'undefined') {
  global.__dirname = '';
}

if (typeof require === 'undefined') {
  let wasmCache = null;

  global.require = function(name) {
    if (name === 'fs') {
      return {
        readFileSync: function(path) {
          console.log('readFileSync called with:', path);
          // Return an empty Uint8Array as a placeholder
          // This will fail later, but won't throw immediately
          return new Uint8Array();
        }
      };
    }
    throw new Error(`Cannot find module: ${name}`);
  };
}
