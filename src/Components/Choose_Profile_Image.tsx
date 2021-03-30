import React, { useRef, useState } from 'react';
import { Modal, Row, Input, Typography } from 'antd';
import log from 'electron-log';
import saveProfilePic from '../modules/saveProfilePicture';

// import { FileImageOutlined } from '@ant-design/icons'
const { Text } = Typography;

// eslint-disable-next-line react/prop-types
const ChangeProfileImg = ({ setProfileImg, currentImg }: any) => {
  const inputURL: any = useRef(null);
  const inputFILE: any = useRef(null);
  const [loading, setLoading] = useState(false);
  const Textstyle = { marginBottom: '3px' };
  const title = 'Choose a Profile Image';

  const SET_PROFILE_IMAGE = async () => {
    let DATA: any;

    if (inputFILE.current.input.files.length) {
      const filePath = inputFILE.current.input.files[0].path;
      DATA = { type: 'file', url: filePath };
    } else if (inputURL.current.state.value) {
      const URL = inputURL.current.state.value;
      DATA = { type: 'url', url: URL };
    }
    // eslint-disable-next-line promise/catch-or-return
    if (DATA) {
      setLoading(true);
      // eslint-disable-next-line promise/catch-or-return
      saveProfilePic(DATA)
        // eslint-disable-next-line promise/always-return
        .then((imgPath) => {
          // eslint-disable-next-line promise/always-return
          console.log(`Setting img path -> ${imgPath}`);
          if (imgPath) {
            setProfileImg({ imgURL: imgPath, showDialog: false });
            // eslint-disable-next-line no-console
          } else console.log('failed');
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          setProfileImg(currentImg);
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Modal
      title={title}
      visible
      centered
      confirmLoading={loading}
      cancelButtonProps={{ style: { display: 'none' } }}
      onOk={SET_PROFILE_IMAGE}
      onCancel={() => {
        // const if_old_img_present = currentImg ? currentImg : null;
        if (currentImg)
          setProfileImg({ showDialog: false, imgURL: currentImg });
      }}
    >
      <Row style={{ marginBottom: '15px' }}>
        <Text style={Textstyle}>Choose a Image from Computer</Text>
        <Input type="file" accept="image/x-png,image/jpeg" ref={inputFILE} />
      </Row>
      <Row>
        <Text style={{ margin: '5px auto', fontStyle: 'italic' }}>OR</Text>
      </Row>
      <Row>
        <Text style={Textstyle}>Enter Image URL</Text>
        <Input
          ref={inputURL}
          type="url"
          placeholder="Example - https://picsum.photos/seed/picsum/300/300"
        />
      </Row>
    </Modal>
  );
};

export default ChangeProfileImg;
