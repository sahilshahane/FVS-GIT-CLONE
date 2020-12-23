import { PythonShell } from 'python-shell';

const runPythonScript = (
  scriptName: string,
  options = { changeDirectory: String, args: Array<string>('') },
  handler: (arg0: any) => void,
  errorHandler = (_err: any, _code: any, _sig: any) => {}
) => {
  const { changeDirectory, args } = options;
  if (changeDirectory) {
    const options = {
      mode: 'text',
      // pythonPath: 'path/to/python',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: 'assets/python-scripts/',
      args: [`-cd`, `${changeDirectory}`, ...args],
    };
    const script = PythonShell.run(scriptName, options);

    script.on('message', (data) => {
      handler(JSON.parse(data));
    });

    script.end((err, code, signal) => {
      if (err) errorHandler(err, code, signal);
    });
  }
};

export default runPythonScript;
