import React from 'react';
import PropTypes from 'prop-types';
import AdminNavbar, { Footer } from '../components';

const PrivateLayout = ({ children, ...rest }) => (
  <>
    <AdminNavbar />
    <div {...rest}>
      {children}
    </div>
    <Footer />

  </>
);

PrivateLayout.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.object.isRequired,
};

export default PrivateLayout;
