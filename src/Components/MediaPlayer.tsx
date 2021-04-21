/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeMediaType,
  changeToNextMedia,
  changeToPreviousMedia,
} from '../Redux/MediaPlayerSlicer';

const MediaPlayer = () => {
  const mediaType = useSelector((state) => state.Media.mediaType);
  const mediaLocation = useSelector((state) => state.Media.mediaLocation);
  const dispatch = useDispatch();

  const addVideoListeners = () => {
    const videoPlayerBackground = document.querySelector(
      '.video-media-background'
    );
    const videoPlayer = document.querySelector('.media');

    videoPlayer?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    videoPlayer?.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        videoPlayer?.pause();
        dispatch(changeMediaType(false));
      }
      e.stopPropagation();
    });
    videoPlayerBackground?.addEventListener('click', () => {
      videoPlayer?.pause();
      dispatch(changeMediaType(false));
    });
  };

  const addButtonListeners = () => {
    const btnPrev = document.querySelector('.btn-prev');
    const btnNext = document.querySelector('.btn-next');

    btnNext?.addEventListener('click', (e) => {
      dispatch(changeToNextMedia());
      e.stopPropagation();
    });

    btnPrev?.addEventListener('click', (e) => {
      dispatch(changeToPreviousMedia());
      e.stopPropagation();
    });
  };

  const addImageListeners = () => {
    const imageBackground = document.querySelector('.image-background');
    const image = document.querySelector('.media');

    imageBackground?.addEventListener('click', (e) => {
      e.stopPropagation();
      dispatch(changeMediaType(false));
    });

    image?.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  };

  return (
    <>
      {mediaType === 'video' ? (
        <div
          className="video-media-background"
          onLoadStart={() => {
            addVideoListeners();
            addButtonListeners();
          }}
        >
          <button
            type="button"
            className="btn btn-prev"
            style={{ color: 'black' }}
          >
            PREVIOUS
          </button>
          <video src={mediaLocation} className="media" controls />
          <button
            type="button"
            className="btn btn-next"
            style={{ color: 'black' }}
          >
            NEXT
          </button>
        </div>
      ) : (
        ''
      )}

      {mediaType === 'image' ? (
        <div className="image-background">
          <button
            type="button"
            className="btn btn-prev"
            style={{ color: 'black' }}
          >
            PREVIOUS
          </button>
          <img
            src={mediaLocation}
            onLoad={() => {
              addImageListeners();
              addButtonListeners();
            }}
            className="media"
            alt="A imsge"
          />
          <button
            type="button"
            className="btn btn-next"
            style={{ color: 'black' }}
          >
            NEXT
          </button>
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default MediaPlayer;
