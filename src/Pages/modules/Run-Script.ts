import { PythonShell, PythonShellError } from 'python-shell';
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

  const script = PythonShell.run(scriptPath, {
    mode: 'text',
    // pythonPath: 'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: '.',
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

  if (errorHandler) script.end(errorHandler);
  else
    script.end((err, code, signal) => {
      if (err)
        showError(String(err), `Exit Code : ${code}\nSignal : ${signal}`);
    });

  return () => {
    script.childProcess.kill('SIGINT');
  };
};

export default runPythonScript;
