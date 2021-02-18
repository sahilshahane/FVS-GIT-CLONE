import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import path from 'path';
import { selectDirectory } from '../modules/select_directory_dialog';
import log from '../modules/log';
import { CCODES, sendSchedulerTask } from '../modules/get_AppData';

const initFolder = async () => {
  let SELECTED_FOLDER = null;

  // if (!(process.env.NODE_ENV === 'development'))
  // else SELECTED_FOLDER = path.resolve('Testing');
  SELECTED_FOLDER = await selectDirectory({});

  sendSchedulerTask({
    code: CCODES.INIT_DIR,
    data: { path: SELECTED_FOLDER, force: true },
  });
};

const AddFolder = () => {
  log('Rendering AddFolder.tsx');

  const [spinIcon, setSpinIcon] = useState(false);
  // console.log('Rendering Add-Folder.tsx');

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, margin: '2rem' }}>
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
