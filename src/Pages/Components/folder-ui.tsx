import React from 'react';

<<<<<<< HEAD
const Folder = ({ folderInfo, updateRoute }: any) => {
  console.log("Folder-UI recieved data ", folderInfo);
  const { name, syncStatus } = folderInfo;
  return (
    <div
      onDoubleClick={() => {
        updateRoute(folderInfo.localLocation);
      }}
=======
const Folder = ({ folderInfo }: any) => {
  const { name, sStatus } = folderInfo;
  return (
    <div
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
      style={{
        background: ' rgb(27, 27, 27)',
        height: '75px',
        borderRadius: '5px',
        padding: '5px',
      }}
    >
      <h3>{name}</h3>
<<<<<<< HEAD
      {syncStatus === true ? (
=======
      {sStatus === 'true' ? (
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};

export default Folder;
