import React, { useState, useEffect } from 'react';
import { Input, AutoComplete, Row } from 'antd';
import log from '../modules/log';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Add a path which doesnt have many files/folders in it
// The problem is that the allFiles variable on line [46] is not updating after the useEffect line[49]
// Hence in the filterOptions functions' else part line[55], allFiles is still an empty array.
// Once that is done the list will be updated and a relative path from the home directory will be displayed.

const repoInfo = [
  {
    localLocation: "/home/uttkarsh/Programming/JavaScript/NodeJs/TestingPythonShell"
  }
]

const getAllData = (repoInfo:any) => {
  let folderList:any = [];
  let fileList:any = [];
  const home = os.homedir();

  repoInfo.map((repo:any) => {
    //Recursive function to get all the file and folders withing a repository
    const getAllFiles = (dir:any) => {
      let files = fs.readdirSync(dir);
      for(let file of files){
        let next = path.join(dir, file);
        if(fs.lstatSync(next).isDirectory()==true){
          folderList.push({value: path.relative(home, next)});
          getAllFiles(next);
        } else {
          fileList.push({value: path.relative(home, next)});
        }
      }
    }
    getAllFiles(repo.localLocation);
  })
  return [...folderList, ...fileList]; 
}

const NAV_BAR = () => {
  log('Rendering NAV_BAR.tsx');
  const [options, setOptions] = useState([]);
  let allFiles:any = [];

  useEffect(()=>{
    allFiles = getAllData(repoInfo);   
  }, []);
  
  const filterOptions = (enteredText:any) => {
    if(!enteredText)  {
      setOptions([]);
    } else {
      // allFiles = getAllData(repoInfo);   
      let filesToShow:any = [];
      allFiles.map((file:any) => {
        if( path.basename(file.value).indexOf(enteredText) > -1 ){
          filesToShow.push(file);
        }
      });
      setOptions(filesToShow);
    }
  }

  return (
    <Row>
      <AutoComplete
        onSearch={filterOptions}
        options={options}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <Input.Search size="large" placeholder="input here" enterButton />
      </AutoComplete>
    </Row>
  );
};

export default NAV_BAR;
