/* eslint-disable jsx-a11y/media-has-caption */
import React, { useContext } from 'react';
import VideoContext from '../modules/VideoContext';

const VideoPlayer = () => {
  const { videoPath, setVideoPath } = useContext(VideoContext);

  const addEventListeners = () => {
    const videoPlayerBackground = document.querySelector(
      '.video-player-background'
    );
    const videoPlayer = document.querySelector('.video-player');

    videoPlayer?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    videoPlayer?.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        videoPlayer?.pause();
        setVideoPath(false);
      }
      e.stopPropagation();
    });
    videoPlayerBackground?.addEventListener('click', () => {
      videoPlayer?.pause();
      setVideoPath(false);
    });
  };

  return (
    <>
      {videoPath ? (
        <div
          className="video-player-background"
          onLoadStart={() => addEventListeners()}
        >
          <video src={videoPath} controls className="video-player" />
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default VideoPlayer;
