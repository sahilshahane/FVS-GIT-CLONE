import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { selectDirectory } from '../modules/select_directory_dialog';
import log from '../modules/log';
import { addRepository } from '../modules/Redux/UserRepositorySlicer';
import {
  CCODES,
  setSchedulerHandler,
  sendSchedulerTask,
} from '../modules/get_AppData';
import path from 'path';

const initFolder = async () => {
  let SELECTED_FOLDER = null;

  if (!(process.env.NODE_ENV === 'development'))
    SELECTED_FOLDER = await selectDirectory({});
  else SELECTED_FOLDER = path.resolve('Testing');

  sendSchedulerTask({
    code: CCODES['INIT_DIR'],
    data: { path: SELECTED_FOLDER },
  });
};

const AddFolder = () => {
  log('Rendering AddFolder.tsx');
  const dispatch = useDispatch();

  const [spinIcon, setSpinIcon] = useState(false);
  // console.log('Rendering Add-Folder.tsx');

  const Handler = (data: any) => {
    console.log(data);
    switch (data.code) {
      case CCODES['INIT_DONE']:
        dispatch(
          addRepository({
            displayName: data.data.folderName,
            localLocation: data.data.localPath,
          })
        );
        break;
    }
  };

  useEffect(() => {
    setSchedulerHandler(Handler);
  }, []);

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
