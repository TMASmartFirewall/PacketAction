import { connect } from "react-redux";
import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import {
  Navbar,
  Nav,
  NavItem,
  NavLink,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Input,
  UncontrolledAlert,
  Dropdown,
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
  ButtonGroup,
  Button,
  Form,
  FormGroup,
} from "reactstrap";
import Notifications from "../Notifications";
import { logoutUser } from "../../actions/user";
import {
  openSidebar,
  closeSidebar,
  changeSidebarPosition,
  changeSidebarVisibility,
} from "../../actions/navigation";

import sender1 from "../../images/1.png";
import sender2 from "../../images/2.png";
import sender3 from "../../images/3.png";

import avatar from "../../images/people/a5.jpg";

import s from "./Header.module.scss";
import "animate.css";

class Header extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    sidebarPosition: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.doLogout = this.doLogout.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.toggleMessagesDropdown = this.toggleMessagesDropdown.bind(this);
    this.toggleSupportDropdown = this.toggleSupportDropdown.bind(this);
    this.toggleSettingsDropdown = this.toggleSettingsDropdown.bind(this);
    this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.toggleSearchOpen = this.toggleSearchOpen.bind(this);

    this.state = {
      visible: true,
      messagesOpen: false,
      supportOpen: false,
      settingsOpen: false,
      searchFocused: false,
      searchOpen: false,
      notificationsOpen: false,
    };
  }

  toggleNotifications = () => {
    this.setState({
      notificationsOpen: !this.state.notificationsOpen,
    });
  };

  onDismiss() {
    this.setState({ visible: false });
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }

  toggleMessagesDropdown() {
    this.setState({
      messagesOpen: !this.state.messagesOpen,
    });
  }

  toggleSupportDropdown() {
    this.setState({
      supportOpen: !this.state.supportOpen,
    });
  }

  toggleSettingsDropdown() {
    this.setState({
      settingsOpen: !this.state.settingsOpen,
    });
  }

  toggleAccountDropdown() {
    this.setState({
      accountOpen: !this.state.accountOpen,
    });
  }

  toggleSearchOpen() {
    this.setState({
      searchOpen: !this.state.searchOpen,
    });
  }

  toggleSidebar() {
    this.props.isSidebarOpened
      ? this.props.dispatch(closeSidebar())
      : this.props.dispatch(openSidebar());
  }

  moveSidebar(position) {
    this.props.dispatch(changeSidebarPosition(position));
  }

  toggleVisibilitySidebar(visibility) {
    this.props.dispatch(changeSidebarVisibility(visibility));
  }

  render() {
    return (
      <Navbar className={`d-print-none main-navbar ${s.root}`}>
        <Collapse
          className={`${s.searchCollapse} ml-lg-0 mr-md-3`}
          isOpen={this.state.searchOpen}
        >
          <InputGroup
            className={`${s.navbarForm} ${
              this.state.searchFocused ? s.navbarFormFocused : ""
            }`}
          >
            <InputGroupAddon addonType="prepend" className={s.inputAddon}>
              <InputGroupText>
                <i className="fa fa-search" />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="search-input-2"
              placeholder="Search..."
              className="input-transparent"
              onFocus={() => this.setState({ searchFocused: true })}
              onBlur={() => this.setState({ searchFocused: false })}
            />
          </InputGroup>
        </Collapse>

        <Nav className="ml-md-0 d-flex nav-responsive">
          <Dropdown
            nav
            isOpen={this.state.notificationsOpen}
            toggle={this.toggleNotifications}
            id="basic-nav-dropdown"
            className={`${s.notificationsMenu}`}
            style={{ marginRight: "auto" }}
          >
            <DropdownMenu
              right
              className={`${s.notificationsWrapper} py-0 animate__animated animate__faster animate__fadeInUp`}
            >
              <Notifications />
            </DropdownMenu>
          </Dropdown>
          <NavItem className="d-lg-none d-md-block d-sm-none">
            <NavLink
              onClick={this.toggleSearchOpen}
              className={s.navItem}
              href="#"
            >
              <i className="glyphicon glyphicon-search" />
            </NavLink>
          </NavItem>          
          <NavItem className="d-md-none">
            <NavLink
              onClick={this.toggleSidebar}
              className={`${s.navItem} text-white`}
              href="#"
            >
              <i className="fa fa-bars" />
            </NavLink>
          </NavItem>
        </Nav>
      </Navbar>
    );
  }
}

function mapStateToProps(store) {
  return {
    isSidebarOpened: store.navigation.sidebarOpened,
    sidebarVisibility: store.navigation.sidebarVisibility,
    sidebarPosition: store.navigation.sidebarPosition,
  };
}

export default withRouter(connect(mapStateToProps)(Header));
