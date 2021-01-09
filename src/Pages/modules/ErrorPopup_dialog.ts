import { Modal } from 'antd';

const ShowError = (title = '', message = '') => {
  Modal.error({
    title,
    content: message,
  });
};

export default ShowError;
