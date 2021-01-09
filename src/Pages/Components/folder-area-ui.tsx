import React from 'react';
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~// FILE UI //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const File = ({ fileInfo }: any) => {
  // console.log('File-UI recieved data ', fileInfo);
  const { name, syncStatus } = fileInfo;
  return (
    <div
      className="file-ui"
      style={{
        background: 'rgb(100, 0, 0)',
        height: '75px',
        borderRadius: '5px',
        padding: '5px',
      }}
    >
      <h3>{name.length > 20 ? `${name.slice(0, 20)}...` : name}</h3>
      {syncStatus === true ? (
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~// FOLDER UI //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const Folder = ({ folderInfo, updateRoute }: any) => {
  // console.log('Folder-UI recieved data ', folderInfo);
  const { name, syncStatus } = folderInfo;
  return (
    <div
      onDoubleClick={() => {
        updateRoute(folderInfo.localLocation);
      }}
      className="folder-ui"
      style={{
        background: ' rgb(27, 27, 27)',
        height: '75px',
        borderRadius: '5px',
        padding: '5px',
      }}
    >
      <h3>{name.length > 20 ? `${name.slice(0, 20)}...` : name}</h3>
      {syncStatus === true ? (
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};
