import { Modal } from 'antd';

const ShowError = (title: String, message: String) => {
  Modal.error({
    title,
    content: message,
  });
};

export const ShowInfo = (title: string = '', message: string = 'null') => {
  const data = {};

  if (title) data.title = title;
  if (message) data.content = message;

  Modal.info(data);
};

export const destryAllModals = () => {
  Modal.destroyAll();
};

export default ShowError;
