import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";

const styles = theme => ({
    multilineColor: {
        color: 'white'
    },
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },

  cssLabel: {
    color: "white"
  },
  'input': {
    'color': {
      textOverflow: 'ellipsis !important',
      color: 'white'
    }
  },

  cssOutlinedInput: {
    "&$cssFocused $notchedOutline": {
      borderColor: 'white'
    }
  },

  cssFocused: {
      "&$cssFocused $notchedOutline": {
      borderColor: 'white'
    }

  },

  notchedOutline: {
    borderWidth: "1px",
    borderColor: "white !important"
  }
});

class ValidField extends React.Component {

    constructor(props){
        super(props);
    }
  state = {
    name: "Add domain"
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleSubmit = val => {
    //alert('A name was submitted: ' + this.state.name);
    this.props.callBack(this.state.name);

  }

  render() {
    const { classes } = this.props;

    return (
      <form onSubmit={this.handleSubmit} className={classes.container} noValidate autoComplete="off">
        <TextField
          id="standard-name"
          label="Add FQDN"
          className={classes.textField}
          onChange={this.handleChange("name")}
          margin="normal"
          variant="outlined"
          InputLabelProps={{
            classes: {
              root: classes.cssLabel,
              focused: classes.cssFocused
            }
          }}
          InputProps={{
            classes: {
              root: classes.cssOutlinedInput,
              focused: classes.cssFocused,
              notchedOutline: classes.notchedOutline,
              input: classes.input
            },
            className: classes.multilineColor,
          }}
        />
      </form>
    );
  }
}

ValidField.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ValidField);