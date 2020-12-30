import { PythonShell, PythonShellError } from 'python-shell';
import showError from './ErrorPopup';

const runPythonScript: (
  scriptPath: string,
  handler: (arg0: { code: number }) => void,
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

  const script = PythonShell.run(scriptPath, {
    mode: 'text',
    // pythonPath: 'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: '.',
    args: [`-cd`, `${changeDirectory}`, ...args],
  });

  script.on('message', (data) => {
    handler(JSON.parse(data));
  });
  if (errorHandler) script.end(errorHandler);
  else
    script.end((err, code, signal) => {
      if (err)
        showError(String(err), `Exit Code : ${code}\nSignal : ${signal}`);
    });
};

export default runPythonScript;
