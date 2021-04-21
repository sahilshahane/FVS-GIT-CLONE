import React from 'react';
import { Modal } from 'antd';
import ReduxStore from '../Redux/store';
import { RepositoryInfo } from '../Redux/UserRepositorySlicer';

interface ContentProps {
  info: RepositoryInfo;
}

const Content = (props: ContentProps) => {
  const { displayName, localLocation } = props.info;
  return (
    <div>
      <div>
        <div>
          <span>Name - </span>
          {displayName}
        </div>
      </div>
      <div>
        <span>Offline Location - </span>
        <i>{localLocation}</i>
      </div>
    </div>
  );
};

interface RemoveRepositoryDialogIF {
  text?: string;
  onOk?: () => any;
  RepoID: string;
}

// eslint-disable-next-line import/prefer-default-export
export const removeRepositoryDialog = (options: RemoveRepositoryDialogIF) => {
  const { RepoID, text, onOk } = options;
  const { UserRepoData } = ReduxStore.getState();

  Modal.info({
    title: text || 'A Repository was removed from Google Drive',
    content: <Content info={UserRepoData.info[RepoID]} />,
    onOk,
  });
};
