/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect } from 'react';
import { Row, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Animate from 'rc-animate';
import { useSelector } from 'react-redux';
import ChangeProfileImg from './Choose_Profile_Image';
import log from 'electron-log';
import {
  GetGoogleUsername,
  GetGoogleProfilePictureURL,
} from '../Redux/AppSettingsSlicer';

const { Text } = Typography;
const { useState } = React;

// eslint-disable-next-line react/prop-types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Profile = ({ showName }: any) => {
  const [profileImg, setProfileImg] = useState({
    showDialog: false,
    imgURL: null,
  });

  // console.log('Rendering Profile.tsx');
  const Username = useSelector(GetGoogleUsername);
  const ProfilePicture = useSelector(GetGoogleProfilePictureURL);
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
    ProfilePicture
      ? setProfileImg({ ...profileImg, imgURL: ProfilePicture })
      : '';
  }, [Username]);

  return (
    <Row align="middle">
      <Animate transitionName="fade">
        {profileImg.showDialog && (
          <ChangeProfileImg
            {...{ setProfileImg }}
            currentImg={ProfilePicture}
          />
        )}
      </Animate>
      <Row
        onClick={() => setProfileImg({ ...profileImg, showDialog: true })}
        style={{ cursor: 'pointer', margin: 'auto' }}
      >
        <Avatar
          src={profileImg.imgURL}
          shape="circle"
          size="large"
          icon={<UserOutlined />}
        />
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
    </Row>
  );
};

export default Profile;
