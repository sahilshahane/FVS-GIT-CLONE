import React from 'react';
import { AiFillFile } from 'react-icons/ai';
import { BsFillFolderFill } from 'react-icons/bs';
import { nanoid } from 'nanoid';
import { setCurrentDirectory } from '../Redux/UserRepositorySlicer';

const renderTitle = (title: string) => <span>{title}</span>;
const renderItem = (
  title: string,
  filePath: string,
  RepoID: string,
  isFile: boolean,
  dispatch: Function
) => ({
  key: nanoid(),
  value: title,
  label: (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
      onClick={() => {
        dispatch(
          setCurrentDirectory({
            RepoID,
            localLocation: filePath,
          })
        );
      }}
    >
      {title}
      <span className="center">{filePath}</span>
      <span>{isFile ? <AiFillFile /> : <BsFillFolderFill />}</span>
    </div>
  ),
});

export { renderTitle, renderItem };
