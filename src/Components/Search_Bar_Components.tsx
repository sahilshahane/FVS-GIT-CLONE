import React from 'react';
import { AiFillFile } from 'react-icons/ai';
import { BsFillFolderFill } from 'react-icons/bs';
import { v4 as uuid } from 'uuid';

const renderTitle = (title: string) => <span>{title}</span>;
const renderItem = (title: string, filePath: string, isFile: boolean) => ({
  key: uuid(),
  value: title,
  label: (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {title}
      <span className="center">{filePath}</span>
      <span>{isFile ? <AiFillFile /> : <BsFillFolderFill />}</span>
    </div>
  ),
});

export { renderTitle, renderItem };
