import React from 'react';

const Folder = ({ folderInfo }: any) => {
  const { name, sStatus } = folderInfo;
  return (
    <div
      style={{
        background: ' rgb(27, 27, 27)',
        height: '75px',
        borderRadius: '5px',
        padding: '5px',
      }}
    >
      <h3>{name}</h3>
      {sStatus === 'true' ? (
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};

export default Folder;
