import React, { useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import data from './folder-info';
import FolderArea from './folder-area';

const fs = require('fs');
const path = require('path');

const Routing = () => {
  const [route, setRoute] = useState(data);
  const routeHistory = [''];

  const updateRoute = (newRoute: string) => {
    let newData = [];
    fs.readdir(newRoute, (err, files) => {
      if (err) {
        console.error(err);
        return console.error(
          `THERE WAS AN ERROR WHILE TRAVERSING THE DIRECTORY-> ${newRoute}`
        );
      }
      files.forEach((file: string) => {
        newData = [
          ...newData,
          {
            id: nanoid(),
            name: path.basename(file),
            syncStatus: true,
            localLocation: path.join(newRoute, file),
          },
        ];
      });
      console.log("FINISHED");
      setRoute(newData);
    });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {routeHistory.forEach((r) => {})}
      <FolderArea updateRoute={updateRoute} data={route} />
    </div>
  );
};

const breadCrums = () => {
  return (
    
  )
}

export default Routing;
