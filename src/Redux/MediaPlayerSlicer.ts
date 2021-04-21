import { createSlice } from '@reduxjs/toolkit';
import path from 'path';
// eslint-disable-next-line import/no-cycle
import { checkExtensionType } from '../Components/folder-area-ui';

export const MediaPlayerSlice = createSlice({
  name: 'mediaPlayer',
  initialState: {
    mediaType: '',
    mediaLocation: '',
    allMediaFiles: [],
  },
  reducers: {
    changeMediaType: (state, action) => {
      state.mediaType = action.payload.mediaType;
      state.mediaLocation = action.payload.mediaPath;
    },
    setAllMediaFiles: (state, action) => {
      const mediaFiles: string[] = [];
      const allFiles = action.payload.mediaFiles;

      allFiles.forEach((file: string) => {
        const ext = path.extname(file);
        const type = checkExtensionType(ext);
        if (type === 'image' || type === 'video') {
          mediaFiles.push(file);
        }
      });
      state.allMediaFiles = mediaFiles;
    },
    changeToNextMedia: (state) => {
      const parentPath = path.dirname(state.mediaLocation);
      const currentMediaIndex = state.allMediaFiles.indexOf(
        path.basename(state.mediaLocation)
      );
      let nextMediaIndex = 0;
      let nextMedia = '';

      if (currentMediaIndex !== state.allMediaFiles.length - 1) {
        nextMediaIndex = currentMediaIndex + 1;
      }
      nextMedia = state.allMediaFiles[nextMediaIndex];
      state.mediaLocation = path.join(parentPath, nextMedia);
      state.mediaType = checkExtensionType(path.extname(nextMedia));
    },
    changeToPreviousMedia: (state) => {
      const parentPath = path.dirname(state.mediaLocation);
      const currentMediaIndex = state.allMediaFiles.indexOf(
        path.basename(state.mediaLocation)
      );
      let nextMediaIndex = state.allMediaFiles.length - 1;
      let nextMedia = '';

      if (currentMediaIndex !== 0) {
        nextMediaIndex = currentMediaIndex - 1;
      }
      nextMedia = state.allMediaFiles[nextMediaIndex];
      state.mediaLocation = path.join(parentPath, nextMedia);
      state.mediaType = checkExtensionType(path.extname(nextMedia));
    },
  },
});

export default MediaPlayerSlice.reducer;
export const {
  changeMediaType,
  setAllMediaFiles,
  changeToNextMedia,
  changeToPreviousMedia,
} = MediaPlayerSlice.actions;
