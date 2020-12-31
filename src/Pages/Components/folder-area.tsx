import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import { nanoid } from '@reduxjs/toolkit';
import Folder from './folder-ui';
import data from './folder-info';
import runPythonScript from '../modules/Run-Script';

const FolderArea = () => {
  const [folderInfo, setFolderInfo] = useState(data);

  return (
    <>
      <Row gutter={[5, 5]} className="folder-area">
        {folderInfo.map((folder) => {
          return (
            <Col
              xs={{ span: 24 }}
              sm={{ span: 12 }}
              md={{ span: 8 }}
              lg={{ span: 6 }}
              xl={{ span: 6 }}
              xxl={{ span: 6 }}
              key={nanoid()}
            >
              <Folder folderInfo={folder} />
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default FolderArea;
