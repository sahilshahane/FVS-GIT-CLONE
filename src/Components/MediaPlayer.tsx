/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMediaType } from '../modules/MediaPlayer';
import {
  closeMediaPlayer,
  playNextMedia,
  playPreviousMedia,
} from '../Redux/MediaPlayerSlicer';
import { store } from '../Redux/store';

const MediaPlayer = () => {
  const [mediaLocation, setMediaLocation] = useState('');

  const {
    mediaFileStack,
    showMediaPlayer,
    currentPlayingIndex,
    currentPlayingPath,
  } = useSelector((state: store) => state.MediaPlayer);

  const [mediaType, setMediaType] = useState<'video' | 'image' | 'other'>();
  const [showNextBtn, setShowNextBtn] = useState(true);
  const [showPrevBtn, setShowPrevBtn] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    if (mediaFileStack.length) {
      if (currentPlayingIndex === mediaFileStack.length - 1)
        setShowNextBtn(false);
      else setShowNextBtn(true);

      if (currentPlayingIndex === 0) setShowPrevBtn(false);
      else setShowPrevBtn(true);

      if (currentPlayingPath && currentPlayingPath !== mediaLocation) {
        setMediaType(getMediaType(currentPlayingPath));
        setMediaLocation(currentPlayingPath);
      }
    }
  }, [currentPlayingIndex, currentPlayingPath, mediaFileStack, mediaLocation]);

  const handleNextMedia = () => {
    dispatch(playNextMedia());
  };
  const handlePreviousMedia = () => {
    dispatch(playPreviousMedia());
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
        <div
          style={{
            visibility: showPrevBtn ? 'visible' : 'hidden',
          }}
        >
          <button
            type="button"
            style={{ color: 'black' }}
            onClick={handlePreviousMedia}
          >
            PREVIOUS
          </button>
        </div>

        {mediaFileStack.length && mediaType === 'image' && (
          <img src={mediaLocation} className="media" alt="A imsge" />
        )}

        {mediaFileStack.length && mediaType === 'video' && (
          <video src={mediaLocation} className="media" controls />
        )}
        <div>
          <button type="button" style={{ color: 'black' }} onClick={handleExit}>
            Exit
          </button>

          <div
            style={{
              visibility: showNextBtn ? 'visible' : 'hidden',
            }}
          >
            <button
              type="button"
              style={{ color: 'black' }}
              onClick={handleNextMedia}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediaPlayer;
