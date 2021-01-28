import React, { useState, useEffect } from 'react';
import { Input, AutoComplete, Row } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  GoTo_Repository,
  move_To_NextLocation,
} from '../modules/Redux/UserRepositorySlicer';
import { Load_IgnoreGlobalPaths } from '../modules/get_AppData';
import log from '../modules/log';
import fs from 'fs';
import path from 'path';
import os from 'os';

let allFiles:object[] = [];

const getAllData = (repoInfo:any) => {
  let folderList:any = [];
  let fileList:any = [];
  const home = os.homedir();

  const ignoreData:string[] = Load_IgnoreGlobalPaths().GloballyIgnoredData.paths;

  repoInfo.map((repo:any) => {
    const getAllFiles = (dir:any) => {
      let files = fs.readdirSync(dir);
      for(let file of files){
        let next = path.join(dir, file);                              
        if(fs.lstatSync(next).isDirectory()==true){
          if(!ignoreData.includes(path.basename(next))){
            folderList.push({value: path.relative(home, next)});      
            getAllFiles(next);
          }
        } else {
          if(!ignoreData.includes(path.basename(next))){
            fileList.push({value: path.relative(home, next)});
          }
        }
      }
    }
    getAllFiles(repo.localLocation);
  })
  return [...folderList, ...fileList];                                
}                                                                     

const NAV_BAR = () => {
  const [options, setOptions] = useState([]);
  const repositoryData = useSelector((state:any)=>{
    return state.UserRepoData.info;
  });
  const dispatch = useDispatch();

  log('Rendering NAV_BAR.tsx');

  useEffect(()=>{
    allFiles = getAllData(repositoryData);
  }, [repositoryData]);
  
  const filterOptions = (enteredText:any) => {
    if(!enteredText)  {
      setOptions([]);
    } else {
      let filesToShow:any = [];
      allFiles.map((file:any) => {
        if( path.basename(file.value).indexOf(enteredText) > -1 ){
          filesToShow.push(file);
        }
      });
      setOptions(filesToShow);
    }
  }
  
  const updateFolderArea = (newLocation:string) => {
    dispatch(move_To_NextLocation(path.basename(newLocation)));
  }

  return (
    <Row>
      <AutoComplete
        onSearch={filterOptions}
        options={options}
        style={{ width: '100%', alignItems: 'center' }}
        onSelect={updateFolderArea}
      >
        <Input.Search size="large" placeholder="Search File/Folder" enterButton />
      </AutoComplete>
    </Row>
  );
};

export default NAV_BAR;




// Added searching functionality
// When the application starts all the files/folders in the repo are traversed excluding the files/folders from global ignore.
// Things mentioned above are done in getAllData function on line [16] 

// Added Methods in get_AppData to insert the globally ignored files.
// Completed the empty AddGlobalIgnore function in IgnoreDataSelector
// The global ignores are stored in assets > installation > .usp > folder-metadata > globallyIgnoredFiles.json

// Cons of the current implementation are
// 1) The ignore list is not reloaded after adding a new ignore. Changes take effect from the next reload.
// 2) ALl the files and folders are synchronously traversed, hence slowing the loading time when starting.
