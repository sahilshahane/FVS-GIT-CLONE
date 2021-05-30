import React, { useState, useEffect } from 'react';
import loadingIcon from '../../assets/icons/loading.gif';

const NoConnection = () => {
  return (
    <div
      className="no-connection-message"
      style={{ height: '100vh', width: '100vw' }}
    >
      <img src={loadingIcon} alt="loading" />
    </div>
  );
};

const ConnectionError = () => {
  const [internetAvailable, setInternetAvailable] = useState(true);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const internetPresent = navigator.onLine;
      if (!internetPresent) {
        setInternetAvailable(false);
      }
      if (internetPresent) {
        setInternetAvailable(true);
      }
    }, 3000);
    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  return (
    <>
      {!internetAvailable ? (
        <NoConnection />
      ) : (
        <div style={{ display: 'none' }} />
      )}
    </>
  );
};

export default ConnectionError;
