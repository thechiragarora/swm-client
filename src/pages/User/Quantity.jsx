
import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import {
  Button, CircularProgress, InputAdornment,
  TextField, FormHelperText, Paper,
} from '@material-ui/core';
import * as yup from 'yup';
import { callApi } from '../../lib/utils/api';
import { SnackbarConsumer } from '../../contexts/SnackBarProvider/SnackBarProvider';

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  error: {
    color: 'red',
    margin: 10,
  },
  main: {
    width: 'auto',
    display: 'block',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 700,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px
    ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  button: {
    margin: 'auto',
  },
});

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

// default values for props:
const defaultProps = {
  classes: {},
};

class Quantity extends React.Component {
  schema = yup.object().shape({
    firstName: yup
      .string()
      .required(),
    lastName: yup
      .string()
      .required(),
    email: yup.string().email().required(),
    address: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    zip: yup.string().required(),
    plastic: yup.number().required(),
    metal: yup.number().required(),
  });

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      snackCheck: false,
      addressform: {
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        plastic: '',
        metal: '',
      },
      error: {
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        plastic: '',
        metal: '',
      },
      isTouched: {
        firstName: false,
        lastName: false,
        email: false,
        address: false,
        city: false,
        state: false,
        zip: false,
        plastic: false,
        metal: false,
      },
    };
  }

  handleChange = field => (event) => {
    const { isTouched, addressform } = this.state;

    this.setState({
      addressform: { ...addressform, [field]: event.target.value },
      isTouched: { ...isTouched, [field]: true },
    }, this.handleValidate(field));
  };

  handleValidate = field => () => {
    const {
      addressform, error, isTouched,
    } = this.state;
    const {
      firstName, lastName, email, address, city, state, zip, plastic, metal,
    } = addressform;
    this.schema.validate({
      firstName, lastName, email, address, city, state, zip, plastic, metal,
    }, { abortEarly: false }).then(() => {
      this.setState({
        error: { ...error, [field]: '' },
        isTouched: { ...isTouched, [field]: true },
      });
    }).catch((err) => {
      if (!err.inner.some(er => er.path === field)) {
        this.setState({
          error: { ...error, [field]: '' },
          isTouched: { ...isTouched, [field]: true },
        });
      }
    });
  }

  handleOnBlur = field => () => {
    const {
      addressform, error, isTouched,
    } = this.state;
    const {
      firstName, lastName, email, address, city, state, zip, plastic, metal,
    } = addressform;
    this.schema.validate({
      firstName, lastName, email, address, city, state, zip, plastic, metal,
    }, { abortEarly: false }).then(() => {
      this.setState({
        error: { ...error, [field]: '' },
        isTouched: { ...isTouched, [field]: true },
      });
    }).catch((err) => {
      err.inner.forEach((er) => {
        if (er.path === field) {
          this.setState({
            error: { ...error, [field]: er.message },
            isTouched: { ...isTouched, [field]: true },
          });
        }
      });
    });
  }

  hasError = () => {
    const { error } = this.state;
    if (error.firstName === '' && error.lastName === '' && error.email === ''
    && error.address === '' && error.city === '' && error.state === '' && error.zip === ''
    && error.plastic === '' && error.metal === '') {
      return false;
    }
    return true;
  }

  getError = (field) => {
    const { isTouched, error } = this.state;
    let result = '';
    if (isTouched[field] === true) {
      result = error[field];
    }
    return result;
  }

  showBooleanError = (field) => {
    const { isTouched } = this.state;
    if (isTouched[field] === true) {
      return true;
    }
    return false;
  }

  buttonChecked = () => {
    const { isTouched } = this.state;
    let touched = 0;
    let result = false;
    const checkError = this.hasError();
    Object.keys(isTouched).forEach((i) => {
      if (isTouched[i] === true) {
        touched += 1;
      }
    });
    if (!checkError && touched === 9) {
      result = true;
    } else if (checkError && touched !== 9) {
      result = false;
    }
    return result;
  }

  handleSubmit = async (e, values) => {
    e.preventDefault();
    let id = '';
    const { addressform } = this.state;
    this.setState({
      loader: true,
    });
    const getID = await callApi('get', {}, 'user', {});
    if (getID.status) {
      getID.data.data.documents.forEach((element) => {
        if (addressform.email === element.email) {
          // eslint-disable-next-line no-underscore-dangle
          id = element._id;
        }
      });
      const { firstName, lastName, ...rest } = addressform;
      console.log('asdas', getID, id, rest)
      const result = await callApi('put', { dataToUpdate: rest, id }, 'order');
      // eslint-disable-next-line react/prop-types
      const { history } = this.props;
      console.log('inside quantity ', this.props);
      if (result.status) {
        this.setState({
          loader: false,
        });
        values.openSnack('Your order is placed', 'success');
        history.push('/user/orders/placed');
      } else {
        values.openSnack(result.message, 'error');
        this.setState({
          snackCheck: true,
          loader: false,
        });
      }
    } else {
      console.log('Unable to get ID');
      values.openSnack('Unable to get ID', 'error');
    }
  };

  render() {
    const { classes } = this.props;
    const { loader, snackCheck } = this.state;

    return (
      <React.Fragment>
        <main className={classes.main}>
          <Paper className={classes.paper}>
            <Typography component="h1" variant="h4" align="center">
              Your Address & Quantity
            </Typography>
            <Grid container spacing={24}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="outlined-firstname"
                  label="FirstName"
                  className={classes.textField}
                  margin="normal"
                  variant="outlined"
                  onChange={this.handleChange('firstName')}
                  onBlur={this.handleOnBlur('firstName')}
                />
                <FormHelperText id="component-error-text1" className={classes.error}>
                  {this.getError('firstName')}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="outlined-lastname"
                  label="LastName"
                  className={classes.textField}
                  margin="normal"
                  variant="outlined"
                  onChange={this.handleChange('lastName')}
                  onBlur={this.handleOnBlur('lastName')}
                />
                <FormHelperText id="component-name-text1" className={classes.error}>
                  {this.getError('lastName')}
                </FormHelperText>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="outlined-email-input"
                  label="Email"
                  className={classes.textField}
                  type="email"
                  name="email"
                  autoComplete="email"
                  margin="normal"
                  variant="outlined"
                  onChange={this.handleChange('email')}
                  onBlur={this.handleOnBlur('email')}
                />
                <FormHelperText id="component-email-text2" className={classes.error}>
                  {this.getError('email')}
                </FormHelperText>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="outlined-address-input"
                  label="Address"
                  className={classes.textField}
                  type="text"
                  name="address"
                  autoComplete="address"
                  margin="normal"
                  variant="outlined"
                  onChange={this.handleChange('address')}
                  onBlur={this.handleOnBlur('address')}
                />
                <FormHelperText id="component-address-text2" className={classes.error}>
                  {this.getError('address')}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="outlined-city-input"
                  label="City"
                  className={classes.textField}
                  type="text"
                  name="city"
                  autoComplete="city"
                  margin="normal"
                  variant="outlined"
                  onChange={this.handleChange('city')}
                  onBlur={this.handleOnBlur('city')}
                />
                <FormHelperText id="component-city-text2" className={classes.error}>
                  {this.getError('city')}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="outlined-state-input"
                  label="State"
                  className={classes.textField}
                  type="text"
                  name="state"
                  autoComplete="state"
                  margin="normal"
                  variant="outlined"
                  onChange={this.handleChange('state')}
                  onBlur={this.handleOnBlur('state')}
                />
                <FormHelperText id="component-state-text2" className={classes.error}>
                  {this.getError('state')}
                </FormHelperText>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="outlined-zip-input"
                  label="Zip"
                  className={classes.textField}
                  type="text"
                  name="zip"
                  autoComplete="zip"
                  margin="normal"
                  variant="outlined"
                  onChange={this.handleChange('zip')}
                  onBlur={this.handleOnBlur('zip')}
                />
                <FormHelperText id="component-zip-text2" className={classes.error}>
                  {this.getError('zip')}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="plastic waste"
                  variant="outlined"
                  className={classes.textField}
                  name="Plastic waste quantity"
                  label="Plastic waste quantity"
                  fullWidth
                  onChange={this.handleChange('plastic')}
                  onBlur={this.handleOnBlur('plastic')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
                  }}
                />
                <FormHelperText id="component-plastic-text2" className={classes.error}>
                  {this.getError('plastic')}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="metal waste"
                  variant="outlined"
                  className={classes.textField}
                  name="Metal waste quantity"
                  label="Metal waste quantity"
                  fullWidth
                  onChange={this.handleChange('metal')}
                  onBlur={this.handleOnBlur('metal')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
                  }}
                />
                <FormHelperText id="component-metal-text2" className={classes.error}>
                  {this.getError('metal')}
                </FormHelperText>
              </Grid>
              <SnackbarConsumer>
                {value => (
                  <div className={classes.button}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={(!this.buttonChecked() || loader)}
                      onClick={(e) => {
                        this.handleSubmit(e, value);
                      }}
                    >
                      {
                        (!loader || snackCheck)
                          ? <b>Order</b>
                          : <CircularProgress size={24} thickness={4} />
                      }
                    </Button>
                  </div>
                )}
              </SnackbarConsumer>
            </Grid>
          </Paper>
        </main>
      </React.Fragment>
    );
  }
}

Quantity.propTypes = propTypes;
Quantity.defaultProps = defaultProps;

export default withStyles(styles)(Quantity);
