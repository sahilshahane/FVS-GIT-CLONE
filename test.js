const { PythonShell, PythonShellError } = require('python-shell');
const path = require('path');

const Run_PythonScheduler = () => {
  const scriptPath = path.join('assets', 'pythonScripts', 'scheduler.py');

  let OPTIONS = {
    mode: 'json',
    // pythonPath: 'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: __dirname,
  };

  if (process.env.NODE_ENV === 'development') {
    OPTIONS.args = ['-dev'];
  }

  const serverScript = new PythonShell(scriptPath, OPTIONS);

  serverScript.on('message', (data) => {
    console.log(data);
  });

  serverScript.on('error', (err) => {
    // console.log(err);
  });

  serverScript.on('stderr', (err) => {
    // console.log(err);
  });

  return serverScript;
};

const serverScript = Run_PythonScheduler();
