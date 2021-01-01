import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import { nanoid } from '@reduxjs/toolkit';
import Folder from './folder-ui';
import File from './file-ui';
import runPythonScript from '../modules/Run-Script';

const fs = require('fs');

const FolderArea = ({ data, updateRoute }: any) => {
  const [folderInfo, setFolderInfo] = useState(data);
  let folderList: any[] = [];
  let fileList: any[] = [];

  useEffect(
    () =>
      runPythonScript('assets/python-scripts/delete.py', (Folder_Obj) =>
        setFolderInfo([...folderInfo, Folder_Obj])
      ),
    []
  );

  console.log('Data recieved at folder-area -> ', data);

  data.map((uno: any) => {
    if (fs.statSync(uno.localLocation).isDirectory()) {
      folderList = [...folderList, uno];
    } else {
      fileList = [...fileList, uno];
    }
    return 0;
  });

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {folderList.map((folder) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Folder
              id={nanoid()}
              folderInfo={folder}
              updateRoute={updateRoute}
            />
          </Col>
        );
      })}

      {fileList.map((file) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <File id={nanoid()} fileInfo={file} />
          </Col>
        );
      })}
    </Row>
  );
};

export default FolderArea;
