const chokidar = require('chokidar');
let prevRepoPath = undefined;

const filewatcher = chokidar.watch('Testing', {
  persistent: true,
  ignoreInitial: false,
  followSymlinks: false,
  disableGlobbing: false,
  usePolling: false,
  interval: 100,
  binaryInterval: 300,
  alwaysStat: false,
  depth: 0,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },

  ignorePermissionErrors: false,
  atomic: true, // or a custom 'atomicity delay', in milliseconds (default 100)
});

// WHEN A FILE IS ADDED/DETECTED
filewatcher.on('add', (path, stats) => {
  console.log(path, stats);
});

// WHEN A FOLDER IS ADDED/DETECTED
filewatcher.on('addDir', (path, stats) => {
  // folders.push(path, stats);
});

// WHEN A FILE IS DELETED
filewatcher.on('unlink', (path, stats) => {
  // folders.push(path, stats);
});

// WHEN A FOLDER IS DELETED
filewatcher.on('unlinkDir', (path, stats) => {
  // folders.push(path, stats);
});
