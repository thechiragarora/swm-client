import React from 'react';
import PropTypes from 'prop-types';
import style from './style';

const propTypes = {
  error: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  hasError: PropTypes.bool.isRequired,
};

// default values for props:
const defaultProps = {
  error: '',
};

class TextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      error,
      hasError,
      // eslint-disable-next-line no-unused-vars
      ...rest
    } = this.props;
    const err = (hasError) ? { ...style.err } : {};
    return (
      <>
        <div>
          <input type="text" style={{ ...style.base, err }} />
          { (error) ? <p style={{ color: 'red' }}>{error}</p> : '' }
        </div>
      </>
    );
  }
}

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default TextField;
