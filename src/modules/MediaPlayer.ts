type CheckExtensionTypeIF = (extName: string) => 'video' | 'image' | 'other';

export const getMediaType: CheckExtensionTypeIF = (extName) => {
  const videoExtensions = /\.(mp4|webm|mpg|ogg)$/i;
  const imageExtensions = /\.(jpg|jpeg|png|image)$/i;

  if (extName.match(videoExtensions)) return 'video';
  if (extName.match(imageExtensions)) return 'image';
  return 'other';
};
