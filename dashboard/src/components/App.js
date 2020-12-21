import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

/* eslint-disable */
import ErrorPage from '../pages/error';
/* eslint-enable */

import '../styles/theme.scss';
import LayoutComponent from '../components/Layout';
import Login from '../pages/login';
import Register from '../pages/register';
import { logoutUser } from '../actions/user';

import socketIOClient from "socket.io-client";

import DataContext from '../updates';
const first_value = [{
    src_ip: '1.1.1.1',
    host: 'aten',
    method: 'Invent',
    
}]




const PrivateRoute = ({dispatch, component, ...rest }) => {
    return ( // eslint-disable-line
        <Route {...rest} render={props => (React.createElement(component, props))}/>
    );
};

const CloseButton = ({closeToast}) => <i onClick={closeToast} className="la la-close notifications-close"/>
    
class App extends React.PureComponent {

    constructor(){
        super();
        

       
    }
        

  render() {
    return (
        <DataContext.Provider value={first_value}>
        <div>
            <ToastContainer
                autoClose={5000}
                hideProgressBar
                closeButton={<CloseButton/>}
            />
            <HashRouter>
                <Switch>
                    <Route path="/" exact render={() => <Redirect to="/app/main"/>}/>
                    <Route path="/app" exact render={() => <Redirect to="/app/main"/>}/>
                    <PrivateRoute path="/app" dispatch={this.props.dispatch} component={LayoutComponent}/>
                    <Route path="/register" exact component={Register}/>
                    <Route path="/login" exact component={Login}/>
                    <Route path="/error" exact component={ErrorPage}/>
                    <Route component={ErrorPage}/>
                    <Redirect from="*" to="/app/main/dashboard"/>
                </Switch>
            </HashRouter>
        </div>
        </DataContext.Provider>

    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(App);
