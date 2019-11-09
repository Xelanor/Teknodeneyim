import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './store/store'

import './App.css'
import HomePage from './containers/HomePage'
import Navbar from './components/Layout/Navbar/Navbar'
import Register from './containers/Auth/Register'
import Login from './containers/Auth/Login'
import PostDetail from './containers/Post/PostDetail'
import Search from './containers/Search/Search'
import ProfilePage from './containers/ProfilePage/ProfilePage'
import ForgotPassword from './containers/Auth/ForgotPassword'
import ResetPassword from './containers/Auth/ResetPassword'
import CreatePost from './containers/ProfilePage/CreatePost'
import NotFoundPage from './components/Layout/NotFoundPage/NotFoundPage'
import BrokerPage from './containers/Broker/BrokerPage'

import RegisteredRoute from './components/PrivateRoutes/RegisteredRoute'
import BrokerRoute from './components/PrivateRoutes/BrokerRoute'
import AdminRoute from './components/PrivateRoutes/AdminRoute'
import AdminPage from './containers/Admin/AdminPage'
import DisplayPosts from './containers/Admin/CrudPages/CrudPosts/CrudPosts'
import EditPost from './containers/Admin/CrudPages/CrudPosts/EditPost'
import DisplayComments from './containers/Admin/CrudPages/CrudComments/CrudComments'
import EditComment from './containers/Admin/CrudPages/CrudComments/EditComment'
import DisplayOffers from './containers/Admin/CrudPages/CrudOffers/CrudOffers'
import DisplayUsers from './containers/Admin/CrudPages/CrudUsers/CrudUsers'

import jwt_decode from "jwt-decode";
import setAuthToken from './utils/setAuthToken'
import { setCurrentUser, logoutUser } from './store/actions/authentication'
import Sidebar from './containers/Sidebar/Sidebar';

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = "./login";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Navbar />
          <div className="lg:flex h-full">
            <Sidebar />
            <Switch>
              <BrokerRoute path="/hisse" exact component={BrokerPage} />
              <Route path="/" exact component={HomePage} />
              <Route path="/register" exact component={Register} />
              <Route path="/login" exact component={Login} />
              <Route path="/sifremi-unuttum" exact component={ForgotPassword} />
              <Route path="/reset/:token" exact component={ResetPassword} />
              <Route path='/post/:slug' component={PostDetail} />
              <Route path='/search/:search' component={Search} />
              <Route path='/profil/:userName' exact component={ProfilePage} />
              <RegisteredRoute path='/yeni-konu' exact component={CreatePost} />
              <AdminRoute path='/admin' exact component={AdminPage} />
              <AdminRoute path='/admin/posts' exact component={DisplayPosts} />
              <AdminRoute path='/admin/posts/edit/:id' exact component={EditPost} />
              <AdminRoute path='/admin/comments' exact component={DisplayComments} />
              <AdminRoute path='/admin/comments/edit/:id' exact component={EditComment} />
              <AdminRoute path='/admin/offers' exact component={DisplayOffers} />
              <AdminRoute path='/admin/users' exact component={DisplayUsers} />
              <Route path="*" component={NotFoundPage} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;