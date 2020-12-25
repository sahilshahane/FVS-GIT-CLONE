import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import Folder from './folder-ui';
import data from './folder-info';
import temp from '../../Run-Script'

const FolderArea = () => {

  const [folderInfo, setFolderInfo] = useState(data);

  useEffect(()=>temp(
    "delete.py", 
    { changedirectory: "", args: [""] }, 
    (data) => { setFolderInfo([...folderInfo, data]);}, 
    (error, code, signal)=>{console.error(error)}),
    [])

  return (
    <>
      <Row gutter={5} className="folder-area">
          {folderInfo.map((folder) => {
            return <>
              <Col xs={{ span: 24 }} md={{ span: 6 }}>
                <Folder key={folder.id} folderInfo={folder} />
              </Col>
            </>
          })}
      </Row>
    </>
  );
};

export default FolderArea;