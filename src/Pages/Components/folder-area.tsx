import React, { useContext } from 'react';
import { Row, Col } from 'antd';
import { nanoid } from '@reduxjs/toolkit';
import fs from 'fs';
import { File, Folder } from './folder-area-ui';
import { RoutingContext } from './FS_Navigation_Bar';

const FolderArea = () => {
  const { route, updateRoute }: any = useContext(RoutingContext);
  const data = route;

  let folderList: any[] = [];
  let fileList: any[] = [];
  let errorList: any[] = [];

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
