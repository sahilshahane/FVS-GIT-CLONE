import React from 'react';

const File = ({ fileInfo }: any) => {
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
      <h3>{`${name}`}</h3>
      {syncStatus === true ? (
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};

export default File;
