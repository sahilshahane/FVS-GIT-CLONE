/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Collapse, Progress } from 'antd';
import { Dispatch } from '@reduxjs/toolkit';
import {
  showUploadsDrawer,
  showDownloadsDrawer,
  SYNC_INPUT,
} from '../modules/Redux/SynchronizationSlicer';

const UploadsPercentage = ({ dispatch }: { dispatch: Dispatch<any> }) => {
  const UPLOAD_LIST: Array<SYNC_INPUT> = useSelector(
    (state) => state.Sync.uploads
  );
  const [percentage, setPercentage] = useState(0);
  useEffect(() => {
    (async () => {
      // FINISED UPLOAD PERCENTAGE IS CALCULATED HERE
      setPercentage(
        (UPLOAD_LIST.filter((val) => val.status === 'FINISHED').length /
          UPLOAD_LIST.length) *
          100
      );
    })();
  }, [UPLOAD_LIST]);
  return (
    <div
      aria-hidden
      onClick={() => dispatch(showUploadsDrawer())}
      style={{ fontSize: '10px', textAlign: 'center' }}
    >
      <Progress
        strokeColor="green"
        type="circle"
        percent={percentage}
        width={45}
        strokeWidth={10}
        className="uploadCircle"
      />
      Uploaded
    </div>
  );
};

const DownloadsPercentage = ({ dispatch }: { dispatch: Dispatch<any> }) => {
  const DOWNLOAD_LIST: Array<SYNC_INPUT> = useSelector(
    (state) => state.Sync.downloads
  );
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    (async () => {
      // FINISED DOWNLOAD PERCENTAGE IS CALCULATED HERE
      setPercentage(
        (DOWNLOAD_LIST.filter((val) => val.status === 'FINISHED').length /
          DOWNLOAD_LIST.length) *
          100
      );
    })();
  }, [DOWNLOAD_LIST]);

  return (
    <div
      aria-hidden
      onClick={() => dispatch(showDownloadsDrawer())}
      style={{ fontSize: '10px', textAlign: 'center' }}
    >
      <Progress
        strokeColor="green"
        type="circle"
        percent={percentage}
        width={45}
        strokeWidth={10}
        className="uploadCircle"
      />
      Downloaded
    </div>
  );
};

const PercentageStatus = () => {
  const dispatch = useDispatch();

  return (
    <>
      <div className="contain-collapse">
        <Collapse
          style={{ width: 200 }}
          defaultActiveKey={['1']}
          expandIconPosition="right"
          bordered={false}
        >
          <Collapse.Panel header="Check Status" key="1">
            <div id="uploadPercentage">
              <UploadsPercentage {...{ dispatch }} />
              <DownloadsPercentage {...{ dispatch }} />
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    </>
  );
};

export default PercentageStatus;
