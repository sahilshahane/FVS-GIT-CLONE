/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect } from 'react';
import { Row, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Animate from 'rc-animate';
import { useSelector } from 'react-redux';
import ChangeProfileImg from './Choose_Profile_Image';

import {
  GetGoogleUsername,
  GetGoogleProfilePictureURL,
  LocalProfileImageSelected,
} from '../Redux/AppSettingsSlicer';

const { Text } = Typography;
const { useState } = React;

const Profile = ({ showName }: any) => {
  const [profileImg, setProfileImg] = useState({
    showDialog: false,
    imgURL: null,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const Username = useSelector(GetGoogleUsername);
  const ProfilePicture = useSelector(GetGoogleProfilePictureURL);
  const LocalProfilePicture = useSelector(LocalProfileImageSelected);
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

    if (LocalProfilePicture) {
      const profileURL = LocalProfilePicture.url;
      setProfileImg({ ...profileImg, imgURL: profileURL });
    } else if (ProfilePicture) {
      setProfileImg({ ...profileImg, imgURL: ProfilePicture });
    }
  }, [Username]);

  return (
    <Row align="middle">
      <Animate transitionName="fade">
        {profileImg.showDialog && (
          <ChangeProfileImg
            {...{ setProfileImg }}
            isModalVisible
            setVisible={setIsModalVisible}
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
