import React, { useState } from "react";
import { Collapse } from 'antd';
import { nanoid } from "@reduxjs/toolkit";
import { LoadingOutlined, CheckCircleTwoTone } from "@ant-design/icons";

const { Panel } = Collapse;

let link:any;
// let link = Object(); //Try this too 

export const updateFileList = (newList: any) => {     //use Immer to update the list.
  link(newList);
}

const UploadingList = () => {
  const temp = [
    {
      "RepoName": "Testing | DEV",
      "UploadingFiles": [
        {
          "Status": true,
          "FileName": "FILE 1"
        },
        {
          "Status": false,
          "FileName": "FILE 2"
        },
        {
          "Status": true,
          "FileName": "FILE 3"
        }, 
      ]
    },
    {
      "RepoName": "Testing | DEV",
      "UploadingFiles": [
        {
          "Status": true,
          "FileName": "FILE 1"
        },
        {
          "Status": false,
          "FileName": "FILE 2"
        },
        {
          "Status": true,
          "FileName": "FILE 3"
        }, 
      ]
    },
  ];
  const [uploadingFiles, setUploadingFiles] = useState(temp);
  link = setUploadingFiles;

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
                      <div className="fileInfo">
                        <div className="fileStatus">{file.Status ? <LoadingOutlined /> : <CheckCircleTwoTone />}</div>
                        <div className="fileName">{file.FileName}</div>
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
