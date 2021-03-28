/* eslint-disable react/jsx-pascal-case */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import path from 'path';
import { File, Folder, Repository } from './folder-area-ui';
import LiveDirView from '../modules/Live-Directory-View';
import { store } from '../Redux/store';
import SelectionArea from '@simonwep/selection-js'

const ALL_Repositories = () => {
  const repositoryData = useSelector((state: store) => {
    return state.UserRepoData.info;
  });

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {Object.keys(repositoryData).map((repoID) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Repository key={nanoid()} info={repositoryData[repoID]} />
          </Col>
        );
      })}
    </Row>
  );
};

const Selected_Repository_Directory = () => {
  const currentDirLocation = useSelector((state: store) => {
    return state.UserRepoData.currentDirLocation;
  });

  const [sortBy, sortByType] = useSelector((state: store) => [
    state.AppSettings.directorySortBy.current,
    state.AppSettings.directorySortBy.type,
  ]);

  const [FILES, set_FILES] = useState([]);
  const [FOLDERS, set_FOLDERS] = useState([]);

  useEffect(() => {
    set_FILES([]);
    set_FOLDERS([]);

    // LIVE RELOAD
    LiveDirView(
      currentDirLocation.join(path.sep), // 'currentDirLocation.join(path.sep)' = current directory path
      set_FILES,
      set_FOLDERS,
      sortBy,
      sortByType
    );
  }, [currentDirLocation, sortBy, sortByType]);

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {/* ~~~~~~~~~~~~~RENDERS FOLDER~~~~~~~~~~~~~ */}
      {FOLDERS.map((folderName: any) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Folder id={nanoid()} info={folderName} />
          </Col>
        );
      })}

      {/* ~~~~~~~~~~~~~RENDERS FILES~~~~~~~~~~~~~ */}
      {FILES.map((fileName: any) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <File id={nanoid()} info={fileName} />
          </Col>
        );
      })}
    </Row>
  );
};

const DisplayArea = () => {
  const isRepositorySelected = useSelector((state: store) => {
    return state.UserRepoData.selectedRepository;
  });

  useEffect(()=>{

      const selection = new SelectionArea({

        // document object - if you want to use it within an embed document (or iframe).
        document: window.document,

        // Class for the selection-area element.
        class: 'selection-area',

        // Query selector or dom-node to set up container for the selection-area element.
        container:"#SelectionArea",

        // Query selectors for elements which can be selected.
        selectables: ["#SelectionArea > *"],

        // Query selectors for elements from where a selection can be started from.
        startareas: ['html'],

        // Query selectors for elements which will be used as boundaries for the selection.
        boundaries: ['html'],

        // px, how many pixels the point should move before starting the selection (combined distance).
        // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
        startThreshold: 10,

        // Enable / disable touch support
        allowTouch: true,

        // On which point an element should be selected.
        // Available modes are cover (cover the entire element), center (touch the center) or
        // the default mode is touch (just touching it).
        intersect: 'touch',

        // Specifies what should be done if already selected elements get selected again.
        //   invert: Invert selection for elements which were already selected
        //   keep: Make stored elements (by keepSelectio()) 'fix'
        //   drop: Remove stored elements after they have been touched
        overlap: 'invert',

        // Configuration in case a selectable gets just clicked.
        singleTap: {

            // Enable single-click selection (Also disables range-selection via shift + ctrl).
            allow: true,

            // 'native' (element was mouse-event target) or 'touch' (element visually touched).
            intersect: 'native'
        },

        // Scroll configuration.
        scrolling: {

            // On scrollable areas the number on px per frame is devided by this amount.
            // Default is 10 to provide a enjoyable scroll experience.
            speedDivider: 10,

            // Browsers handle mouse-wheel events differently, this number will be used as
            // numerator to calculate the mount of px while scrolling manually: manualScrollSpeed / scrollSpeedDivider.
            manualSpeed: 750
        }
});



  },[])

  return (
    <div id="SelectionArea">
      {isRepositorySelected ? (
        <Selected_Repository_Directory />
      ) : (
        <ALL_Repositories />
      )}
    </div>
  );
};

export default DisplayArea;
