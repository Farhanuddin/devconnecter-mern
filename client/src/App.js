import React, { Component } from 'react'
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';

import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import { setCurrentUser, logoutUser } from './actions/authActions';

import { Provider } from 'react-redux';
import store from './store';

import PrivateRoute from './components/common/PrivateRoute';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { clearCurrentProfile } from './actions/profileActions';
import CreateProfile from './components/create-profile/CreateProfile';
import EditProfile from './components/edit-profile/EditProfile';
import AddExperience from './components/add-credentials/AddExperience';
import AddEducation from './components/add-credentials/AddEducation';

//Check for Token

if (localStorage.jwtToken) {
  //Set the Auth token header auth
  setAuthToken(localStorage.jwtToken);
  //Decode token and get user info and exp
  const decoded = jwt_decode(localStorage.jwtToken);

  //Set Current User in redux state using redux method and is Authenticated
  store.dispatch(setCurrentUser(decoded));

  //Check for expired Token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    //Logout the user
    store.dispatch(logoutUser());

    //Clear current profile
    store.dispatch(clearCurrentProfile());
    //TODO: CLear current Profile
    // Redirect to Login
    window.location.href = '/login';
  }

}

class App extends Component {

  render() {

    return (
      <Provider store={store}>
        <Router>
          <div className="App" >
            <Navbar />
            <Route exact path="/" component={Landing} />
            <div className="container">
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Switch>
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
              </Switch>
              <Switch>
                <PrivateRoute exact path="/create-profile" component={CreateProfile} />
              </Switch>
              <Switch>
                <PrivateRoute exact path="/edit-profile" component={EditProfile} />
              </Switch>
              <Switch>
                <PrivateRoute exact path="/add-experience" component={AddExperience} />
              </Switch>
              <Switch>
                <PrivateRoute exact path="/add-education" component={AddEducation} />
              </Switch>
            </div>
            <Footer />
          </div>
        </Router>
      </Provider >
    );
  }
}

export default App;
