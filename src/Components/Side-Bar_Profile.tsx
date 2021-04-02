/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable promise/catch-or-return */
import React, { useRef, useState, useEffect } from 'react';
import { Modal, Row, Input, Typography, Avatar } from 'antd';
import log from 'electron-log';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../Redux/store';
import saveProfilePic from '../modules/saveProfilePicture';
import { setProfilePhoto } from '../Redux/AppSettingsSlicer';

const { Text } = Typography;

const ChangeProfileDialog = (props: {
  isDialogVisible: boolean;
  setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isDialogVisible, setDialogVisible } = props;
  const input: React.MutableRefObject<{
    url: Input | null;
    file: Input | null;
  }> = useRef({ url: null, file: null });

  const [loading, setLoading] = useState(false);
  const Textstyle = { marginBottom: '3px' };
  const dispatch = useDispatch();

  const SET_PROFILE_IMAGE = async () => {
    let DATA: { type: 'file' | 'url'; url: string } | undefined;

    if (input.current.file?.input?.files?.length) {
      DATA = { type: 'file', url: input.current.file.input.files[0].path };
    } else if (input.current.url?.state?.value) {
      DATA = { type: 'url', url: input.current.url.state.value };
    }

    if (DATA) {
      setLoading(true);

      saveProfilePic(DATA)
        .then((imgPath) =>
          // `${imgPath}?time=${new Date().getTime()}` is added to remove browser caching for that specific image
          dispatch(setProfilePhoto(`${imgPath}?time=${new Date().getTime()}`))
        )
        .then(() => setDialogVisible(false))
        .then(() => log.info('Profile Image Changed'))
        .catch((err) => log.error('Failed Setting Profile Image', err))
        .finally(() => setLoading(false));
    }
  };

  const [isVisible, setVisible] = useState(true);

  useEffect(() => setDialogVisible(isVisible), [isVisible, setDialogVisible]);

  return (
    <Modal
      title="Choose a Profile Image"
      visible={isDialogVisible}
      centered
      confirmLoading={loading}
      cancelButtonProps={{ style: { display: 'none' } }}
      onOk={SET_PROFILE_IMAGE}
      destroyOnClose
      onCancel={(e) => {
        setVisible(false);
      }}
    >
      <Row style={{ marginBottom: '15px' }}>
        <Text style={Textstyle}>Choose a Image from Computer</Text>
        <Input
          type="file"
          accept="image/x-png,image/jpeg"
          ref={(ele) => {
            input.current.file = ele;
          }}
        />
      </Row>
      <Row>
        <Text style={{ margin: '5px auto', fontStyle: 'italic' }}>OR</Text>
      </Row>
      <Row>
        <Text style={Textstyle}>Enter Image URL</Text>
        <Input
          ref={(ele) => {
            input.current.url = ele;
          }}
          type="url"
          placeholder="Example - https://picsum.photos/seed/picsum/300/300"
        />
      </Row>
    </Modal>
  );
};

const Profile = () => {
  const Username = useSelector(
    (state: store) =>
      state.AppSettings.cloudLoginStatus.googleDrive?.user.displayName
  );
  const ProfilePictureURL = useSelector(
    (state: store) =>
      state.AppSettings.cloudLoginStatus.googleDrive?.user.photoLink
  );

  const [MinimizedName, setMinimizedName] = useState('');

  useEffect(() => {
    if (Username)
      setMinimizedName(
        Username.split(' ')
          .reduce((prev, current) => {
            return prev + current[0];
          }, '')
          .toUpperCase()
      );
  }, [Username]);

  const [isDialogVisible, setDialogVisible] = useState(false);

  return (
    <Row
      align="middle"
      onClick={() => setDialogVisible(true)}
      style={{ cursor: 'pointer', margin: 'auto' }}
    >
      {isDialogVisible && (
        <ChangeProfileDialog
          isDialogVisible={isDialogVisible}
          setDialogVisible={setDialogVisible}
        />
      )}
      <Avatar
        src={ProfilePictureURL}
        shape="circle"
        size="large"
        style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}
      >
        {MinimizedName}
      </Avatar>
    </Row>
  );
};

export default Profile;
