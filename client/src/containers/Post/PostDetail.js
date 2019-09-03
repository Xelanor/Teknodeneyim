import React, { Component } from 'react';
import axios from 'axios'
import { connect } from "react-redux";
import ReactPaginate from 'react-paginate'
import { withRouter } from 'react-router-dom'

import Spinner from '../../components/UI/Spinner/Spinner'
import NewComment from '../../components/Comments/Comment/NewComment'
import Comments from '../../components/Comments/Comments'

import './PostDetail.css'

class PostDetail extends Component {
  state = {
    postId: "",
    post: null,
    comments: null,
    comment: "",
    commentPerPage: 10,
    currentPage: 0,
    offset: 0,
    elements: []
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.getData()
    }
  }

  getData = () => {
    const postId = this.props.match.params.id
    this.setState({ postId })
    axios.get('/posts/' + postId)
      .then(res => {
        this.setState({
          post: res.data,
          comments: res.data.comments,
          pageCount: Math.ceil(res.data.comments.length / this.state.commentPerPage)
        })
        this.setElementsForCurrentPage()
      })
      .catch(err => { console.log(err) })
  }

  componentDidMount() {
    this.getData()
  }

  setElementsForCurrentPage() {
    let elements = this.state.comments
      .slice(this.state.offset, this.state.offset + this.state.commentPerPage)
    this.setState({ elements: elements });
  }

  handlePageClick = (data) => {
    window.scrollTo(0, 0)
    const selectedPage = data.selected;
    const offset = selectedPage * this.state.commentPerPage;
    this.setState({ currentPage: selectedPage, offset: offset }, () => {
      this.setElementsForCurrentPage();
    });
  }

  onSubmitComment = async (e) => {
    e.preventDefault()
    let comment = {
      username: this.props.auth.user.id,
      content: this.state.comment,
      target: this.state.postId
    }
    let commentId
    await axios.post('/comments/add', comment)
      .then(res => commentId = res.data)
      .catch((error) => { console.log(error); })

    let commentToPost = {
      id: this.state.postId,
      comment: commentId
    }
    await axios.post('/posts/add-comment-to-post', commentToPost)
      .then(res => console.log(res))
      .catch((error) => { console.log(error); })
    this.setState({ comment: "" })
    this.getData()
    window.scrollTo(0, 0)
  }

  onCommentChange = (e) => {
    this.setState({ comment: e.target.value })
  }

  onCommentLiked = async (commentId) => {
    if (this.props.auth.isAuthenticated) {
      let like = {
        userId: this.props.auth.user.id,
      }
      await axios.post('/comments/' + commentId + '/like', like)
        .then(res => console.log(res))
        .catch((error) => { console.log(error); })

      this.getData()
    }
  }

  render() {
    let username, content, createdAt, page, paginationElement
    if (this.state.post) {
      if (this.state.pageCount > 1) {
        paginationElement = (
          <ReactPaginate
            previousLabel={"← Previous"}
            nextLabel={"Next →"}
            breakLabel={<span className="gap">...</span>}
            pageCount={this.state.pageCount}
            onPageChange={this.handlePageClick}
            forcePage={this.state.currentPage}
            containerClassName={"pagination"}
            previousLinkClassName={"previous_page"}
            nextLinkClassName={"next_page"}
            disabledClassName={"disabled"}
            activeClassName={"active"}
          />
        );
      }
      username = this.state.post.username
      content = this.state.post.content
      createdAt = this.state.post.createdAt

      page = (
        <div className="">
          <div className="flex">
            <div class="font-semibold text-2xl text-tekno">
              {content}
            </div>
          </div>
          <div class="flex mt-2">
            <div class="font-normal text-md text-gray-600">
              İster dışarıda parlak güneşin altında, ister karanlıkta
              sinematik izleme deneyiminin keyfini çıkarın. Dinamik Ton
              Haritalama teknolojisi ile HDR10+ sertifikalıdır, videoları
              gerçek renk ve kontrastla oynatır, böylece YouTube'da HDR10+
              içerikleri izlemek canlı ve heyecanlı hale gelir.
            </div>
          </div>
          <div class="flex items-center float-right">
            <div class="font-bold text-sm text-purple-900">
              {createdAt}
            </div>
            <div class="ml-4 font-normal text-sm text-black">
              {username.username}
            </div>
            <img class="w-10 h-10 rounded-full mx-4" src="https://tailwindcss.com/img/jonathan.jpg"
              alt="Avatar of Jonathan Reinink" />
          </div>
          <Comments
            comments={this.state.elements}
            commentLike={this.onCommentLiked}
            user={this.props.auth.isAuthenticated ? this.props.auth.user.id : ""}
          />
        </div>
      )
    } else {
      page = <Spinner />
    }
    return (
      <div className="flex-1 px-4 mb-16 mt-12 items-center">
        {page}
        {this.props.auth.isAuthenticated ? <NewComment onCommentChange={this.onCommentChange} submitForm={this.onSubmitComment} comment={this.state.comment} /> : "Hi"}
        {paginationElement}
      </div>
    );
  }
}


const mapStateToProps = state => ({
  auth: state.auth
});

export default withRouter(connect(mapStateToProps)(PostDetail));