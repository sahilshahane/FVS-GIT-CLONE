/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { getMediaType } from '../modules/MediaPlayer';

export interface MEDIA_PLAYER_INTERFACE {
  showMediaPlayer: boolean;
  mediaFileStack: string[] | [];
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
    showMediaPlayer: (state, action: { payload: string }) => {
      const filePath = action.payload;
      if (filePath) state.currentPlayingPath = filePath;
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
  closeMediaPlayer,
  showMediaPlayer,
} = MediaPlayerSlice.actions;
