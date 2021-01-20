import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Space, Button } from "antd";
import { nanoid } from '@reduxjs/toolkit';
import { relative } from 'path';
import { autoUpdater } from 'electron-updater';

// displayName is to show the name
// uploadInfo is the key/id or something that is passed so that that repo can be identified 
const Repositories = [{
  displayName: "Testing | DEV",
  uploadInfo: "123abc"
}];

const ChooseUpload = forwardRef((props, ref) => {
  
  const [chooseUploadVisible, setChooseVisible] = useState(false);
  
  useImperativeHandle(ref, ()=>({
    show: () => {
      setChooseVisible(true);
    }
  }));

  return (
    <Modal
      title="Choose Folder to upload"
      visible={chooseUploadVisible}
      onCancel={()=>setChooseVisible(false)}
      footer={null}
    >
      {
        Repositories.map(({ displayName, uploadInfo }) => {
          return (
            <div 
              style={{
                // border: "1px solid red",
                position: "relative",
                padding: "10px",
              }} 
              key={nanoid()}
            >
              <span 
                style={{
                  fontFamily: "'Ubuntu', sans-serif",
                  fontSize: "17px",
                }}
              >
                {displayName}
              </span>
              <Button
                type="primary"
                onClick={()=>{CallToSomeFunction(uploadInfo)}} 
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "7px",
                }}
              >
                Upload
              </Button>
            </div>
          )
        })
      }
    </Modal>
  )
});

export default ChooseUpload;
