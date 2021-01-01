import React, { useState, useEffect, useRef } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { Breadcrumb } from 'antd';
import data from './folder-info';
import FolderArea from './folder-area';

const fs = require('fs');
const path = require('path');

let routeHistory = [''];

const Routing = () => {
  const [route, setRoute] = useState(data);
  useEffect(() => {});

  const updateRoute = (newRoute: string) => {
    let newData:
      | any[]
      | ((
          prevState: {
            id: number;
            name: string;
            syncStatus: boolean;
            localLocation: string;
          }[]
        ) => {
          id: number;
          name: string;
          syncStatus: boolean;
          localLocation: string;
        }[]) = [];

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
        setRoute(newData);
      });
    } else {
      setRoute(data);
    }
  };

  return (
    <div className="routing-area" style={{ width: '100%', height: '100%' }}>
      <Breadcrumb
        separator=">"
        style={{ border: '1px solid red', height: '50px' }}
      >
        {routeHistory.map((r) => {
          return (
            <Breadcrumb.Item
              key={nanoid()}
              onClick={() => {
                routeHistory = routeHistory.slice(0, routeHistory.indexOf(r));
                if (routeHistory.length === 0) routeHistory.unshift('');
                console.log('UPDATING ROUTE BY ', r);
                updateRoute(r);
              }}
              className="breadcrumb-item"
            >
              {r === '' ? 'Home' : path.basename(r)}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
      <FolderArea updateRoute={updateRoute} data={route} />
    </div>
  );
};

export default Routing;
