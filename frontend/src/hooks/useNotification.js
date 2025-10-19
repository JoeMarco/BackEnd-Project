import { message } from 'antd';

export const useNotification = () => {
  const success = (msg) => message.success(msg);
  const error = (msg) => message.error(msg);
  const warning = (msg) => message.warning(msg);
  const info = (msg) => message.info(msg);
  
  return { success, error, warning, info };
};