import React, { useState, useEffect } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { Breadcrumb } from 'antd';
import { RoutingContext } from '../modules/routing-context';
import data from './folder-info';
import FolderArea from '../modules/folder-area';

const fs = require('fs');
const path = require('path');

let routeHistory = [''];

const Routing = () => {
  const [route, setRoute] = useState(data);
  useEffect(() => {});

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
      setRoute(data);
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
                {r === '' ? 'Home' : path.basename(r).length > 20 ? `${path.basename(r).slice(0, 20)}...` : path.basename(r)}
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
