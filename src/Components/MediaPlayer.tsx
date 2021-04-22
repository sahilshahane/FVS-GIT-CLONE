/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactPlayer from 'react-player/lazy';
import { AiOutlineClose } from 'react-icons/ai';
import { MdNavigateNext, MdNavigateBefore } from 'react-icons/md';
import { getMediaType } from '../modules/MediaPlayer';
import { closeMediaPlayer } from '../Redux/MediaPlayerSlicer';
import { store } from '../Redux/store';

const MediaPlayer = () => {
  const [mediaLocation, setMediaLocation] = useState('');
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1);
  const { mediaFileStack, showMediaPlayer, currentPlayingPath } = useSelector(
    (state: store) => state.MediaPlayer
  );

  const [mediaType, setMediaType] = useState<'video' | 'image' | 'other'>();
  const [showNextBtn, setShowNextBtn] = useState(true);
  const [showPrevBtn, setShowPrevBtn] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    if (
      currentPlayingIndex < mediaFileStack.length &&
      currentPlayingIndex >= 0
    ) {
      const newMediaPath = mediaFileStack[currentPlayingIndex];
      setMediaType(getMediaType(newMediaPath));
      setMediaLocation(newMediaPath);
      setShowNextBtn(currentPlayingIndex !== mediaFileStack.length - 1);
      setShowPrevBtn(currentPlayingIndex !== 0);
    }
  }, [currentPlayingIndex]);

  useEffect(() => {
    if (
      mediaFileStack.length &&
      currentPlayingPath !== mediaLocation &&
      currentPlayingPath
    ) {
      setMediaType(getMediaType(currentPlayingPath));
      setMediaLocation(currentPlayingPath);
      const newIndex = mediaFileStack.findIndex(
        (val) => currentPlayingPath === val
      );
      setCurrentPlayingIndex(newIndex);
    }
  }, [currentPlayingPath, mediaFileStack]);

  const handleNextMedia = () => {
    if (currentPlayingIndex + 1 < mediaFileStack.length) {
      setCurrentPlayingIndex(currentPlayingIndex + 1);
    }
  };

  const handlePreviousMedia = () => {
    if (currentPlayingIndex - 1 >= 0) {
      setCurrentPlayingIndex(currentPlayingIndex - 1);
    }
  };

  const handleExit = () => dispatch(closeMediaPlayer());
  return (
    <>
      <div
        style={{
          position: 'absolute',
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s',
          opacity: `${showMediaPlayer ? '100%' : '0%'}`,
          transform: `scale(${showMediaPlayer ? 1 : 0})`,
        }}
      >
        <AiOutlineClose
          className="icon"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
          }}
          size="50px"
          onClick={handleExit}
        />

        <MdNavigateBefore
          className="icon"
          size="40px"
          visibility={showPrevBtn ? 'visible' : 'hidden'}
          onClick={handlePreviousMedia}
        />

        {mediaFileStack.length && mediaType === 'image' && (
          <img src={mediaLocation} className="media" alt="" />
        )}

        {mediaFileStack.length && mediaType === 'video' && (
          <ReactPlayer url={mediaLocation} className="media" controls />
        )}

        <MdNavigateNext
          className="icon"
          size="40px"
          visibility={showNextBtn ? 'visible' : 'hidden'}
          onClick={handleNextMedia}
        />
      </div>
    </>
  );
};

export default MediaPlayer;
