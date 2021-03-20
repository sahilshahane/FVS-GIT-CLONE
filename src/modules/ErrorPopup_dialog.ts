import { Modal } from 'antd';

const ShowError = (title = '', message = '') => {
  Modal.error({
    title,
    content: message,
  });
};

export const ShowInfo = (title = '', message = 'null') => {
  const data = {};

  if (title) data.title = title;
  if (message) data.content = message;

  Modal.info(data);
};

export default ShowError;
