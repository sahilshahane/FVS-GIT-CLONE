/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { getMediaType } from '../modules/MediaPlayer';

export interface MEDIA_PLAYER_INTERFACE {
  showMediaPlayer: boolean;
  mediaFileStack: string[] | [];
  currentPlayingIndex?: number;
  currentPlayingPath?: string;
}

const GET: () => MEDIA_PLAYER_INTERFACE = () => {
  return { mediaFileStack: [], showMediaPlayer: false };
};

interface SetAllMediaFilesIF {
  payload: { mediaFilePaths: string[] };
}

export const MediaPlayerSlice = createSlice({
  name: 'mediaPlayer',
  initialState: GET(),
  reducers: {
    setMediaFileStack: (state, action: SetAllMediaFilesIF) => {
      const { mediaFilePaths } = action.payload;

      state.mediaFileStack = mediaFilePaths.filter(
        (filePath) => getMediaType(filePath) !== 'other'
      );
    },
    playNextMedia: (state) => {
      const { mediaFileStack, currentPlayingIndex } = state;
      if (
        typeof currentPlayingIndex === 'number' &&
        currentPlayingIndex + 1 !== state.mediaFileStack.length
      ) {
        state.currentPlayingPath = mediaFileStack[currentPlayingIndex + 1];
        state.currentPlayingIndex = currentPlayingIndex + 1;
      }
    },
    playPreviousMedia: (state) => {
      const { mediaFileStack, currentPlayingIndex } = state;
      if (
        typeof currentPlayingIndex === 'number' &&
        currentPlayingIndex - 1 >= 0
      ) {
        state.currentPlayingPath = mediaFileStack[currentPlayingIndex - 1];
        state.currentPlayingIndex = currentPlayingIndex - 1;
      }
    },
    showMediaPlayer: (state, action: { payload: string }) => {
      const filePath = action.payload;
      if (filePath) {
        state.currentPlayingPath = filePath;
        state.currentPlayingIndex = state.mediaFileStack.findIndex(
          (val) => val === filePath
        );
      }

      state.showMediaPlayer = true;
    },
    closeMediaPlayer: (state) => {
      state.showMediaPlayer = false;
    },
  },
});

export default MediaPlayerSlice.reducer;
export const {
  setMediaFileStack,
  playNextMedia,
  playPreviousMedia,
  closeMediaPlayer,
  showMediaPlayer,
} = MediaPlayerSlice.actions;
