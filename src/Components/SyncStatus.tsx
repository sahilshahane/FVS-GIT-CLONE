/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Collapse, Progress, Row, Col, Space } from 'antd';
import { Dispatch } from '@reduxjs/toolkit';
import {
  showUploadsDrawer,
  showDownloadsDrawer,
  SYNC_DATA_STRUCTURE,
} from '../Redux/SynchronizationSlicer';

const UploadsPercentage = ({ dispatch }: { dispatch: Dispatch<any> }) => {
  const uploadFinishedQueue = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.uploadFinishedQueue
  );
  const totalSessionUploads = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.totalSessionUploads
  );

  const uploadWatingQueue = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.uploadWatingQueue
  );

  const uploadingQueue = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.uploadingQueue
  );

  const [percentage, setPercentage] = useState(0);
  useEffect(() => {
    let totalFinished = 0;
    let totalWaiting = 0;

    (async () => {
      Object.keys(uploadWatingQueue).forEach((RepoID: any) => {
        totalWaiting += uploadWatingQueue[RepoID].length;
      });

      if (!totalWaiting && !uploadingQueue.length) {
        setPercentage(100);
      } else {
        Object.keys(uploadFinishedQueue).forEach((RepoID: any) => {
          totalFinished += uploadFinishedQueue[RepoID].length;
        });
        setPercentage(Math.round((totalFinished / totalSessionUploads) * 100));
      }
    })();
  }, [
    uploadFinishedQueue,
    totalSessionUploads,
    uploadingQueue.length,
    uploadWatingQueue,
  ]);
  return (
    <div
      aria-hidden
      onClick={() => dispatch(showUploadsDrawer())}
      style={{ fontSize: '10px', textAlign: 'center' }}
    >
      <Row justify="center">
        <Progress
          strokeColor="green"
          type="circle"
          percent={percentage}
          width={45}
          strokeWidth={10}
          className="uploadCircle"
        />
      </Row>
      <Row justify="center">Uploaded</Row>
    </div>
  );
};

const DownloadsPercentage = ({ dispatch }: { dispatch: Dispatch<any> }) => {
  const downloadFinishedQueue = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.downloadFinishedQueue
  );
  const totalSessionDownloads = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.totalSessionDownloads
  );

  const downloadingQueue = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.downloadingQueue
  );

  const [percentage, setPercentage] = useState(0);
  useEffect(() => {
    let totalFinished = 0;
    let totalWaiting = 0;

    (async () => {
      if (!totalWaiting && !downloadingQueue.length) {
        setPercentage(100);
      } else {
        Object.keys(downloadFinishedQueue).forEach((RepoID: any) => {
          totalFinished += downloadFinishedQueue[RepoID].length;
        });
        setPercentage(
          Math.round((totalFinished / totalSessionDownloads) * 100)
        );
      }
    })();
  }, [downloadFinishedQueue, totalSessionDownloads, downloadingQueue.length]);
  return (
    <div
      aria-hidden
      onClick={() => dispatch(showDownloadsDrawer())}
      style={{ fontSize: '10px', textAlign: 'center' }}
    >
      <Row justify="center">
        <Progress
          strokeColor="green"
          type="circle"
          percent={percentage}
          width={45}
          strokeWidth={10}
          className="downloadCircle"
        />
      </Row>
      <Row justify="center">Downloaded</Row>
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
          <Collapse.Panel
            header="Check Status"
            key="1"
            className="component-bg"
            id="syncStatus"
          >
            <Row justify="space-around">
              <Space size="middle">
                <Col>{/* <UploadsPercentage {...{ dispatch }} /> */}</Col>
                <Col>{/* <DownloadsPercentage {...{ dispatch }} /> */}</Col>
              </Space>
            </Row>
          </Collapse.Panel>
        </Collapse>
      </div>
    </>
  );
};

export default PercentageStatus;
