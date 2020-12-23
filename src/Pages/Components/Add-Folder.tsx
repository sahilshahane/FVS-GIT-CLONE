import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import selectDir from '../modules/select-directory';
import runPyScript from '../modules/Run-Script';
import showError from '../modules/ErrorPopup';
import log from '../modules/log';

const initFolder = async () => {
  const Handler = (data: any) => {
    console.log(data);
  };

  const errorHandler = (err, code, signal) => {
    showError(String(err), `Exit Code : ${code}\nSignal : ${signal}`);
  };

  const SELECTED_FOLDER = await selectDir();
  runPyScript(
    'main.py',
    {
      changeDirectory: SELECTED_FOLDER,
      args: ['-init'],
    },
    Handler,
    errorHandler
  );
};

const AddFolder = () => {
  log('Rendering AddFolder.tsx');

  const [spinIcon, setSpinIcon] = useState(false);
  // console.log('Rendering Add-Folder.tsx');

  return (
    <div style={{ position: 'absolute', bottom: 0, right: 0, margin: '2rem' }}>
      <Tooltip placement="top" title="Add Folder">
        <Button
          type="primary"
          shape="circle"
          onClick={initFolder}
          onMouseEnter={() => setSpinIcon(true)}
          onMouseLeave={() => setSpinIcon(false)}
          icon={
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            >
              <PlusOutlined style={{ fontSize: '1.5rem' }} spin={spinIcon} />
            </div>
          }
          style={{ padding: '1.7rem' }}
        />
      </Tooltip>
    </div>
  );
};

export default AddFolder;
