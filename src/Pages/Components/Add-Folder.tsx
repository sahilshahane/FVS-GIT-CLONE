import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { selectDirectory } from '../modules/select_directory_dialog';
import runPyScript from '../modules/Run-Script';
import log from '../modules/log';
import { addRepository } from '../modules/Redux/UserRepositorySlicer';

import { CCODES } from '../modules/get_AppData';

const initFolder = async (dispatch: any) => {
  const Handler = (data: any) => {
    switch (data.code) {
      case CCODES['INIT']:
        dispatch(
          addRepository({
            displayName: data.data.folderName,
            localLocation: data.data.localPath,
          })
        );
        break;
    }
  };

  let SELECTED_FOLDER = null;

  if (!(process.env.NODE_ENV === 'development'))
    SELECTED_FOLDER = await selectDirectory({});

  runPyScript(Handler, {
    changeDirectory: SELECTED_FOLDER,
    args: ['-init', '-clean'],
  });
};

const AddFolder = () => {
  log('Rendering AddFolder.tsx');
  const dispatch = useDispatch();

  const [spinIcon, setSpinIcon] = useState(false);
  // console.log('Rendering Add-Folder.tsx');

  return (
    <div style={{ position: 'absolute', bottom: 0, right: 0, margin: '2rem' }}>
      <Tooltip placement="top" title="Add Folder">
        <Button
          type="primary"
          shape="circle"
          onClick={() => initFolder(dispatch)}
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
