import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Modal } from 'antd';
import { selectDirectory, selectFile } from '../modules/select_directory_dialog';
import { nanoid } from 'nanoid';

const IgnoreDataSelector = forwardRef((props, ref) => {
  
  const [StateChooser, setStateChooser] = useState(false);
  const [DirChooser, setDirChooser] = useState(false);
  const [GblChooser, setGblChooser] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      showStateChooser (){
        setStateChooser(true);
      }
    })
  )  

  const chooseFile = () => {
    selectFile().then((choosenFile) => {
      if(choosenFile != null){
        console.log(chooseFile);
      }
    })
  }

  const chooseDirectory = () => {
    selectDirectory().then((choosenDir) => {
        if(choosenDir != null){
          // if(sahilsDummyFunction(choosenDir)){
          //   Modal.success({content: 'Directory ignored successfully'});
          // } else {
          //   // Ask sahil what error message he wants.
          //   Modal.error({title: "There was some problem in ignoring", content: "Try again"});
          // }
        }
    })
  }

  const repositories: any = [{"displayName": "asd", "localLocation": "Testing/"},{"displayName": "asd", "localLocation": "Testing/"}];

  return (
    <>
    {/* --------------------- CHOOSE STATE --------------------- */}
      <Modal
        title="Choose State"
        visible={StateChooser}
        onCancel={() => setStateChooser(false)}
        footer={null}
      >
        <button
          className="ignore-btn"
          onClick={() => {
            setGblChooser(true);
            setStateChooser(false);
          }}
        >
          Ignore Globally
        </button>

        <button
          className="ignore-btn"
          onClick={() => {
            setDirChooser(true);
            setStateChooser(false);
          }}
        >
          Ignore Directory
        </button>
      </Modal>
        
    {/* --------------------- GLOBAL SELECTOR --------------------- */}
    <Modal
        title="Choose Globally"
        visible={GblChooser}
        onCancel={() => setGblChooser(false)}
        footer={null}
      >
        Enter File/Folder name here
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Call sahils function here
          }}
        >
          <input
            style={{ color: 'black' }}
            id="globalIgnore"
            type="text"
            required
          />
        </form>
      </Modal>
      
    {/* --------------------- GLOBAL SELECTOR --------------------- */}
    <Modal
        title="Choose Directory"
        visible={DirChooser}
        onCancel={() => setDirChooser(false)}
        footer={null}
      >
      {
        repositories.map((repo: any) => {
          return (
            <div key={nanoid()}>
              <span>{repo.displayName}</span>
              <span>{repo.localLocation}</span>
              <button className="ignore-btn" onClick={chooseDirectory}>Directory</button>
              <button className="ignore-btn" onClick={chooseFile}>File</button>
            </div>
          )
        })
      }
    </Modal>
    </>
  )

})

export default IgnoreDataSelector;
