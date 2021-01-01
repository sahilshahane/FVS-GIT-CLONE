import { PythonShell, PythonShellError } from 'python-shell';
<<<<<<< HEAD
import showError from './ErrorPopup';

const runPythonScript: (
  scriptPath: string,
  handler: (arg0: any) => void,
  options?: {
    changeDirectory: string;
    args: Array<string> | [];
  },
  errorHandler?: (err: PythonShellError, code: number, signal: string) => void
) => void = (
  scriptPath,
  handler,
  options = { changeDirectory: '.', args: [] },
  errorHandler
) => {
  const { changeDirectory, args } = options;
=======
import path from 'path';
import showError from './ErrorPopup';

const DEFAULT_OPTIONS = {
  scriptPath: path.join('assets', 'pythonScripts', 'main.py'),
  changeDirectory: process.env.NODE_ENV === 'development' ? 'Testing' : '.',
  args: [],
};

const runPythonScript: (
  handler: (arg0: { code: number }, arg1?: () => void) => void,
  options?: {
    scriptPath?: string;
    changeDirectory?: string;
    args?: Array<string>;
  },
  errorHandler?: (err: PythonShellError, code: number, signal: string) => void
) => () => void = (handler, options, errorHandler) => {
  const { scriptPath, changeDirectory, args } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6

  const script = PythonShell.run(scriptPath, {
    mode: 'text',
    // pythonPath: 'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: '.',
<<<<<<< HEAD
    args: [`-cd`, `${changeDirectory}`, ...args],
  });

  script.on('message', (data) => {
    handler(JSON.parse(data));
  });
=======
    args: [`-cd`, `${changeDirectory}`, ...args].concat(
      process.env.NODE_ENV === 'development' ? ['-dev'] : []
    ),
  });

  const forceKill = () => {
    script.childProcess.kill('SIGINT');
  };

  script.on('message', (data) => {
    handler(JSON.parse(data), forceKill);
  });

>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
  if (errorHandler) script.end(errorHandler);
  else
    script.end((err, code, signal) => {
      if (err)
        showError(String(err), `Exit Code : ${code}\nSignal : ${signal}`);
    });
<<<<<<< HEAD
=======

  return () => {
    script.childProcess.kill('SIGINT');
  };
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
};

export default runPythonScript;
