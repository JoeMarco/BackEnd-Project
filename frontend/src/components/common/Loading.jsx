import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './Loading.css';

/**
 * Loading Component
 * Displays a loading spinner with optional message
 */
const Loading = ({ fullScreen = false, message = 'Loading...', size = 'large' }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          <Spin indicator={antIcon} size={size} />
          {message && <p className="loading-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <Spin indicator={antIcon} size={size} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

Loading.propTypes = {
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large']),
};

export default Loading;
