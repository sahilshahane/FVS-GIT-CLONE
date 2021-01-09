import React, { useState, useEffect, useContext } from 'react';
import { Row, Col } from 'antd';
import { nanoid } from '@reduxjs/toolkit';
import fs from 'fs';
import { File, Folder } from './folder-area-ui';
import runPythonScript from '../modules/Run-Script';
import { RoutingContext } from './Routing-area';
import path from 'path';

const FolderArea = () => {
  const { route, updateRoute }: any = useContext(RoutingContext);
  const data = route;

  const [folderInfo, setFolderInfo] = useState(data);
  let folderList: any[] = [];
  let fileList: any[] = [];
  let errorList: any[] = [];

  useEffect(
    () =>
      runPythonScript(
        (Folder_Obj) => setFolderInfo([...folderInfo, Folder_Obj]),
        { scriptPath: path.join('assets\\pythonScripts\\delete.py') }
      ),
    []
  );

  // console.log('Data recieved at folder-area -> ', data);

  data.map((uno: any) => {
    try {
      switch (fs.statSync(uno.localLocation).isDirectory()) {
        case true:
          folderList = [...folderList, uno];
          break;
        case false:
          fileList = [...fileList, uno];
          break;
      }
    } catch {
      errorList = [...errorList, uno];
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
