import React, { useState, useEffect } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { Breadcrumb } from 'antd';
import path from 'path';
import fs from 'fs';
import FolderArea from './folder-area';
import inter from '../modules/Interface';

export const RoutingContext = React.createContext({});

let routeHistory = [''];
let data = { info: [] };

const Load_USER_Repositories = (
  setRoute: React.Dispatch<React.SetStateAction<never[]>>
) => {
  inter
    .getHomeFolderInfo()
    .then((info: any) => JSON.parse(info))
    .then((info: any) => {
      data = info;
      return setRoute(data.info);
    })
    .catch((err: any) => {
      if (err) console.error(err);
    });
};

const updateRoute_Outer = (newRoute: string, setRoute: any) => {
  if (!newRoute) return setRoute(data.info);

  routeHistory.push(newRoute);

  fs.promises
    .readdir(newRoute)
    .then((files: string[]) => {
      const newData = files.map((file: string) => {
        return {
          displayName: path.basename(file),
          syncStatus: false,
          localLocation: path.join(newRoute, file),
        };
      });
      setRoute(newData);
    })
    .catch((err: any) => {
      if (err) return err;
    });
};

const Routing = () => {
  const [route, setRoute] = useState([]);

  useEffect(() => {
    Load_USER_Repositories(setRoute);
  }, []);

  const updateRoute = (newRoute: string) =>
    updateRoute_Outer(newRoute, setRoute);

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
