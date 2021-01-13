import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import fs from 'fs-extra';
import path from 'path';
import { File, Folder, Repository } from './folder-area-ui';

const ALL_Repositories = () => {
  const repositoryData = useSelector((state) => {
    return state.UserRepoData.info;
  });

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {repositoryData.map((Repository_INFO: any) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Repository id={nanoid()} info={Repository_INFO} />
          </Col>
        );
      })}
    </Row>
  );
};

const Selected_Repository_Directory = () => {
  const currentDirLocation = useSelector((state) => {
    return state.UserRepoData.currentDirLocation;
  });

  const [FILES, set_FILES] = useState([]);
  const [FOLDERS, set_FOLDERS] = useState([]);

  useEffect(() => {
    set_FILES([]);
    set_FOLDERS([]);

    const LOCATION = currentDirLocation.join(path.sep);

    fs.promises
      .readdir(LOCATION)
      .then((DIR_DATA: string[]) => {
        DIR_DATA.forEach((fileName) => {
          const filePath = path.join(LOCATION, fileName);
          const stats = fs.statSync(filePath);

          const DATA = {
            name: path.basename(fileName),
            syncStatus: false,
            localLocation: filePath,
          };

          switch (stats.isFile()) {
            case true:
              set_FILES((prev) => [...prev, DATA]);
              break;
            case false:
              set_FOLDERS((prev) => [...prev, DATA]);
              break;
          }
        });
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, [currentDirLocation]);

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {/* ~~~~~~~~~~~~~RENDERS FOLDER~~~~~~~~~~~~~ */}
      {FOLDERS.map((folderName: any) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Folder id={nanoid()} info={folderName} />
          </Col>
        );
      })}

      {/* ~~~~~~~~~~~~~RENDERS FILES~~~~~~~~~~~~~ */}
      {FILES.map((fileName: any) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <File id={nanoid()} info={fileName} />
          </Col>
        );
      })}
    </Row>
  );
};

const DisplayArea = () => {
  const isRepositorySelected = useSelector((state) => {
    return state.UserRepoData.selectedRepository;
  });

  return (
    <div>
      {!isRepositorySelected ? (
        <ALL_Repositories />
      ) : (
        <Selected_Repository_Directory />
      )}
    </div>
  );
};

export default DisplayArea;
