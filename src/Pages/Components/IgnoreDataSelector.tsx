import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, Input, Space, Row , Col } from 'antd';
import { useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import {
  selectDirectory,
  selectFile,
} from '../modules/select_directory_dialog';
import { RepositoryInfo } from '../modules/Redux/UserRepositorySlicer';
import { defaultApp } from 'process';
import { relative } from 'path';

const chooseFile = (
  Handler: any,
  RepositoryPath: undefined | string = null
) => {
  selectFile({ multiSelections: true, defaultPath: RepositoryPath }).then((choosenFile) => {
    console.log(RepositoryPath);
    if (choosenFile) {
      if (RepositoryPath) Handler(choosenFile, RepositoryPath);
      else Handler(choosenFile);
    }
  });
};

const chooseDirectory = async (
  Handler: any,
  RepositoryPath: undefined | string = null
) => {
  selectDirectory({ multiSelections: true, defaultPath: RepositoryPath }).then(
    (choosenDir) => {
      if (choosenDir) {
        if (RepositoryPath) Handler(choosenDir, RepositoryPath);
        else Handler(choosenDir);
      }
    }
  );
};
// -------------------------------------------- GLOBAL CHOOSE --------------------------------------------
const GLOBAL_CHOOSE_DIALOG = ({ GblChooser, setGblChooser }: any) => {
  const AddGlobalIgnore = () => {};
  const CheckandCloseDIalog = () => {
    // CHECK SAVE PROGRESS THEN CLOSE
    setGblChooser(false);
  };
  return (
    <Modal
      title="Choose Globally"
      visible={GblChooser}
      onCancel={CheckandCloseDIalog}
      footer={null}
    >
      <Row>
          <Col>
            <Input type="text" placeholder="Enter File / Folder Name" required />
          </Col>
          <Col>
            <Button type="primary" onClick={AddGlobalIgnore}>Add</Button>
          </Col>
      </Row>
    </Modal>
  );
};

// -------------------------------------------- REPOSITORY CHOOSE --------------------------------------------
const REPOSITORY_CHOOSE_DIALOG = ({ DirChooser, setDirChooser }: any) => {
  const Repositories: Array<RepositoryInfo> = useSelector(
    (state: any) => state.UserRepoData.info
  );

  const saveIgnoreDirs = (dirPaths: Array<string>, localDirectory: string) => {
    console.log(dirPaths);
  };

  const saveIgnoreFiles = (
    filePaths: Array<string>,
    localDirectory: string
  ) => {
    console.log(filePaths);
  };

  const CheckandCloseDIalog = () => {
    // CHECK SAVE PROGRESS THEN CLOSE
    setDirChooser(false);
  };

  return (
    <Modal
      title="Choose Directory"
      visible={DirChooser}
      onCancel={CheckandCloseDIalog}
      footer={null}
    >
      {Repositories.map(({ displayName, localLocation }) => {
        return (
          <div 
            key={nanoid()}
            style={{
              width: "100%",
              display: "flex",
              position: "relative",
              margin: "5px auto"
            }}
          >
            <span style={{fontSize: "17px", marginRight: "10px"}}>{displayName}</span> 
            > 
            <span style={{fontSize: "15px", marginLeft: "10px", color: "grey"}}>{localLocation}</span>
          
            <div 
              style={{position: "absolute", right: "10px", top: "-0px"}}
            >
              <Button
                type="primary"
                size="small"
                onClick={() => chooseDirectory(saveIgnoreDirs, localLocation)}
                style={{marginRight: "5px"}}
              >
                Directory
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => chooseFile(saveIgnoreFiles, localLocation)}
              >
                File
              </Button>
            </div>

          </div>
        );
      })}
    </Modal>
  );
};

const IgnoreDataSelector = forwardRef((props, ref) => {
  const [StateChooser, setStateChooser] = useState(false);
  const [DirChooser, setDirChooser] = useState(false);
  const [GblChooser, setGblChooser] = useState(false);

  useImperativeHandle(ref, () => ({
    show: () => {
      setStateChooser(true);
    },
  }));

  return (
    <>
      {/* --------------------- CHOOSE STATE --------------------- */}
      <Modal
        title="Choose State"
        visible={StateChooser}
        onCancel={() => setStateChooser(false)}
        footer={null}
      >
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setGblChooser(true);
              setStateChooser(false);
            }}
          >
            Ignore Globally
          </Button>

          <Button
            type="primary"
            onClick={() => {
              setDirChooser(true);
              setStateChooser(false);
            }}
          >
            Ignore Directory
          </Button>
        </Space>
      </Modal>

      {GblChooser && (
        <GLOBAL_CHOOSE_DIALOG {...{ GblChooser, setGblChooser }} />
      )}
      {DirChooser && (
        <REPOSITORY_CHOOSE_DIALOG {...{ DirChooser, setDirChooser }} />
      )}
    </>
  );
});

export default IgnoreDataSelector;
