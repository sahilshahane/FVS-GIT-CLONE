/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
<<<<<<< HEAD
import React from 'react';
import { Row, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Animate from 'rc-animate';
import ChangeProfileImg from './changeProfileImg';
import log from '../modules/log';
=======
import React, { useEffect } from 'react';
import { Row, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Animate from 'rc-animate';
import { useSelector } from 'react-redux';
import ChangeProfileImg from './changeProfileImg';
import log from '../modules/log';
import { GetGoogleUsername } from '../modules/Redux/AppSettingsSlicer';
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6

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
<<<<<<< HEAD
  // console.log('Rendering Profile.tsx');

  return (
    <Row>
      <Animate transitionName="fade">
        {profileImg.showDialog && <ChangeProfileImg {...{ setProfileImg }} />}
      </Animate>
      <div
        onClick={() => setProfileImg({ ...profileImg, showDialog: true })}
        style={{ cursor: 'pointer' }}
=======

  // console.log('Rendering Profile.tsx');
  const Username = useSelector(GetGoogleUsername);
  const [MinimizedName, setMinimizedName] = useState(null);

  useEffect(() => {
    setMinimizedName(
      Username.trim()
        .split(' ')
        .reduce((prev: any, current: any[]) => {
          return prev + current[0];
        }, '')
        .toUpperCase()
    );
  }, [Username]);

  return (
    <Row align="middle">
      <Animate transitionName="fade">
        {profileImg.showDialog && <ChangeProfileImg {...{ setProfileImg }} />}
      </Animate>
      <Row
        onClick={() => setProfileImg({ ...profileImg, showDialog: true })}
        style={{ cursor: 'pointer', margin: 'auto' }}
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
      >
        <Avatar
          src={profileImg.imgURL}
          shape="square"
          size="large"
          icon={<UserOutlined />}
        />
<<<<<<< HEAD
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
=======
      </Row>
      <Row style={{ margin: 'auto' }}>
        <Text
          style={{
            fontSize: '1.3rem',
            textTransform: 'capitalize',
          }}
        >
          {!showName ? Username : MinimizedName}
        </Text>
      </Row>
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
    </Row>
  );
};

export default Profile;
