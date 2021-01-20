import React, { useState } from "react";
import { Collapse } from 'antd';
import { nanoid } from "@reduxjs/toolkit";
import { LoadingOutlined, CheckCircleTwoTone } from "@ant-design/icons";
const { Panel } = Collapse;

const temp = [
  {
    "RepoName": "Testing | DEV",
    "UploadingFiles": [
      {
        "FileName": "FILE 1",
        "Status": true,
      },
      {
        "FileName": "FILE 2",
        "Status": false,
      },
      {
        "FileName": "FILE 3",
        "Status": true,
      }, 
    ]
  }
];

let update = Object();

export const updateFileList = (uploadedFile: any) => {
  update(uploadedFile);
}

export const setUploadingFiles = (newList) => {
  update(newList);
}

const UploadingList = () => {
  const [uploadingFiles, setUploadingFiles] = useState(temp);
  update = setUploadingFiles;

  return (
    <Collapse 
      bordered={false} 
      defaultActiveKey={['1']}
      className="uploadingCollapse"
    >
      {
        uploadingFiles.map((repo) => {
          return (
            <>
              <Panel 
                key={nanoid()} 
                header={repo.RepoName} 
                className="uploadingPanel"
              >
                {
                  repo.UploadingFiles.map((file) => {
                    return (
                      <div className="fileInfo-fileList">
                        <div className="fileStatus-fileList">{file.Status ? <LoadingOutlined /> : <CheckCircleTwoTone />}</div>
                        <div className="fileName-fileList">{file.FileName}</div>
                      </div>
                    )
                  })
                }
              </Panel>
            </>
          )
        })
      }
    </Collapse>
  )
}

export default UploadingList;
