import React from 'react';

const Folder = ({ folderInfo, updateRoute }: any) => {
  console.log('Folder-UI recieved data ', folderInfo);
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
      <h3>{name}</h3>
      {syncStatus === true ? (
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};

export default Folder;
