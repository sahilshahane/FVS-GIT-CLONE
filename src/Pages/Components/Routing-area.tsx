import React, { useState, useEffect } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { Breadcrumb } from 'antd';
import path from 'path';
import fs from 'fs';
import { RoutingContext } from '../modules/routing-context';
// import data from './folder-info';
import FolderArea from '../modules/folder-area';
import inter from '../Interface';

let routeHistory = [''];
let data = {};

const LoadFolderData = (
  setRoute: React.Dispatch<React.SetStateAction<never[]>>
) => {
  const filePath = path.join(
    path.dirname(__dirname),
    'assets',
    'folder-metadata',
    'info.json'
  );
  inter
    .getHomeFolderInfo(filePath)
    .then((info: any) => JSON.parse(info))
    .then((info: any) => {
      data = info;
      return setRoute(data.info);
    })
    .catch((err: any) => {
      if (err) console.error(err);
    });
};

const Routing = () => {
  const [route, setRoute] = useState([]);

  useEffect(() => {
    LoadFolderData(setRoute);
  }, []);

  const updateRoute = (newRoute: string) => {
    let newData: any = [];

    if (newRoute !== '') {
      fs.readdir(newRoute, (err: any, files: string[]) => {
        if (err) return err;
        files.forEach((file: string) => {
          newData = [
            ...newData,
            {
              id: nanoid(),
              name: path.basename(file),
              syncStatus: false,
              localLocation: path.join(newRoute, file),
            },
          ];
        });
        routeHistory.push(newRoute);
        return setRoute(newData);
      });
    } else {
      // dont pass the data.info directly when assigning it the value
      // ignore the below error -> Property 'info' does not exist on type 'string'
      setRoute(data.info);
    }
  };

  return (
    <RoutingContext.Provider value={{ updateRoute, route }}>
      <div className="routing-area" style={{ width: '100%', height: '100%' }}>
        <Breadcrumb separator="/" className="breadcrumb">
          {routeHistory.map((r) => {
            return (
              <Breadcrumb.Item
                key={nanoid()}
                onClick={() => {
                  routeHistory = routeHistory.slice(0, routeHistory.indexOf(r));
                  if (routeHistory.length === 0) routeHistory.unshift('');
                  updateRoute(r);
                }}
                className="breadcrumb-item"
              >
                {r === ''
                  ? 'Home'
                  : path.basename(r).length > 20
                  ? `${path.basename(r).slice(0, 20)}...`
                  : path.basename(r)}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
        <FolderArea />
      </div>
    </RoutingContext.Provider>
  );
};

export default Routing;
