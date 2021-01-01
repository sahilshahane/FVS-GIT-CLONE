/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Row, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Animate from 'rc-animate';
import ChangeProfileImg from './changeProfileImg';
import log from '../modules/log';

const { Text } = Typography;
const { useState } = React;

// eslint-disable-next-line react/prop-types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Profile = ({ showName }: any) => {
  log('Rendering Profile.tsx');
  const [profileImg, setProfileImg] = useState({
    showDialog: false,
    imgURL: null,
  });
  // console.log('Rendering Profile.tsx');

  return (
    <Row>
      <Animate transitionName="fade">
        {profileImg.showDialog && <ChangeProfileImg {...{ setProfileImg }} />}
      </Animate>
      <div
        onClick={() => setProfileImg({ ...profileImg, showDialog: true })}
        style={{ cursor: 'pointer' }}
      >
        <Avatar
          src={profileImg.imgURL}
          shape="square"
          size="large"
          icon={<UserOutlined />}
        />
      </div>
      <Animate transitionName="fade">
        {!showName && (
          <Text
            style={{
              fontSize: '1.3rem',
            }}
          >
            User
          </Text>
        )}
      </Animate>
    </Row>
  );
};

export default Profile;
