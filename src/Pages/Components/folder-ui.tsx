import React, { useState, useEffect } from 'react';
import "../../App.global.css"

const Folder = ({ folderInfo }: any) => {
  const {name, sStatus} = folderInfo;
  return (
    <div className="folder-bubble">
      <h3>{name}</h3>
      {
        (sStatus==="true") ? (
          <span className="synced-true" />  
        ) : (
          <span className="synced-false" />
        )
      }
    </div>
  );
}

export default Folder;
