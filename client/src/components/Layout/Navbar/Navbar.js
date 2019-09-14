import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { logoutUser } from '../../../store/actions/authentication';
import NavbarLinks from './NavbarLinks'

import logo from '../../../assets/logo1.png'

class Navbar extends Component {
  state = {
    searchText: ""
  }

  NavBarLinks = [
    {
      content: "Huawei",
      to: "huawei",
      title: "Huawei ürünleri"
    },
    {
      content: "Apple",
      to: "apple",
      title: "Apple ürünleri"
    },
    {
      content: "Samsung",
      to: "Samsung",
      title: "Samsung ürünleri"
    },
    {
      content: "Lenovo",
      to: "lenovo",
      title: "Lenovo ürünleri"
    }
  ]

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser(this.props.history);
  };

  onSearchSubmit = e => {
    e.preventDefault()
    let searchText = this.state.searchText
    this.setState({ searchText: "" })
    if (searchText.length !== 0) {
      this.props.history.push("/search/" + searchText)
    }
  }

  onSearchChange = e => {
    this.setState({ searchText: e.target.value })
  }

  render() {
    const { isAuthenticated, user } = this.props.auth;
    const authLinks = (
      <div className="flex flex-row-reverse">
        <Link to="#" className="inline-block text-base px-4 py-2 leading-none border rounded-lg bg-tekno text-white border-white hover:border-tekno hover:text-tekno hover:bg-transparent mt-2 lg:mt-0" onClick={this.onLogoutClick}>Çıkış Yap</Link>
        <Link to={{ pathname: "/profil/" + user.username }} >
          <img
            src={user.avatar}
            alt={user.name}
            title={user.name}
            className="w-10 h-10 rounded-full mx-4"
          />
        </Link>
      </div>
    )
    const guestLinks = (
      <>
        <Link to="/login" className="inline-block text-base px-4 py-2 mr-4 leading-none border rounded-lg bg-tekno text-white border-white hover:border-tekno hover:text-tekno hover:bg-transparent mt-2 lg:mt-0">Giriş</Link>
        <Link to="/register" className="inline-block text-base px-4 py-2 leading-none border rounded-lg bg-tekno text-white border-white hover:border-tekno hover:text-tekno hover:bg-transparent mt-2 lg:mt-0">Kayıt Ol</Link>
      </>
    )
    return (
      <div className="border-b-2 border-gray-200" id="mainNavBar">
        <div className="mb-2">
          <nav className="flex items-center justify-between flex-wrap bg-transparent p-1">
            <div className="flex items-center flex-shrink-0 text-white mr-8">
              <Link to="/">
                <img
                  src={logo}
                  alt="some text"
                  width="130"
                  height="40"
                />
              </Link>
            </div>
            <div className="block md:hidden">
              <button
                className="flex items-center px-3 py-2 border rounded text-tekno border-tekno hover:text-white hover:bg-tekno"
              >
                <svg
                  className="fill-current h-3 w-3"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Menu</title>
                  <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
              </button>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center md:w-auto">
              <div className="text-sm lg:flex-grow">
                <form onSubmit={this.onSearchSubmit}>
                  <input type="search"
                    className="outline-none bg-purple-white shadow rounded-full border-0 p-2 pr-16 focus:border-tekno"
                    placeholder="Deneyim Bul..."
                    value={this.state.searchText}
                    onChange={this.onSearchChange} />
                  <button type="submit">
                    <i style={{ color: "#F67e7d" }} className="fa fa-search ml-1 p-2"></i>
                  </button>
                </form>
              </div>
            </div>
            <div className="inline-flex">
              <div>
                {isAuthenticated ? authLinks : guestLinks}
              </div>
            </div>
          </nav>
          <nav id="headers" className="container mx-auto w-5/6 mt-3">
            <ul className="flex items-stretch justify-between w-full m-0 p-0">
              {this.NavBarLinks.map(link => {
                return (
                  <NavbarLinks to={link.to} title={link.title} content={link.content} />
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    );
  }
}

Navbar.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, { logoutUser })(withRouter(Navbar));