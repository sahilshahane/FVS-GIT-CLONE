import React from 'react';
import { Input, AutoComplete, Row } from 'antd';
import log from 'electron-log';

const onSelect = (value: unknown) => {
  // eslint-disable-next-line no-console
  console.log(value);
};

const NAV_BAR = () => {
  // console.log('Rendering Nav-bar.tsx');

  return (
    <Row>
      <AutoComplete
        onSelect={onSelect}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <Input.Search size="large" placeholder="input here" enterButton />
      </AutoComplete>
    </Row>
  );
};

export default NAV_BAR;
