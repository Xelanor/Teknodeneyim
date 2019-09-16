import React, { Component } from 'react';
import axios from 'axios'
import { connect } from "react-redux";
import ReactPaginate from 'react-paginate'
import { withRouter } from 'react-router-dom'

import Spinner from '../../components/UI/Spinner/Spinner'
import NewComment from '../../components/Comments/Comment/NewComment'
import Comments from '../../components/Comments/Comments'

import { likeComment, savePost } from '../../store/actions/likeAction'
import { fetchComments, submitComment, fetchSidePosts } from '../../store/actions/fetchActions'
import { COMMENT_PER_PAGE } from '../../store/actions/types'

import './PostDetail.css'

class PostDetail extends Component {
  state = {
    comment: "",
    currentPage: 0,
    offset: 0,
    elements: null,
    loading: false
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.post !== prevProps.post) {
      this.setElementsForCurrentPage()
    }
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.props.fetchComments(this.props.match.params.id)
    }
  }

  componentDidMount() {
    this.props.fetchComments(this.props.match.params.id)
  }

  setElementsForCurrentPage() {
    let elements = this.props.post.post.comments
      .slice(this.state.offset, this.state.offset + COMMENT_PER_PAGE)
    this.setState({ elements: elements });
  }

  handlePageClick = (data) => {
    window.scrollTo(0, 0)
    const selectedPage = data.selected;
    const offset = selectedPage * COMMENT_PER_PAGE;
    this.setState({ currentPage: selectedPage, offset: offset }, () => {
      this.setElementsForCurrentPage();
    });
  }

  onSubmitComment = async (e) => {
    e.preventDefault()
    this.setState({ loading: true })
    let comment = {
      username: this.props.auth.user.id,
      content: this.state.comment,
      target: this.props.post.post._id
    }
    await this.props.submitComment(comment)
    this.setState({ comment: "" })
    this.props.fetchComments(this.props.match.params.id)
    this.setState({ loading: false })
    window.scrollTo(0, 0)
    this.props.fetchSidePosts()
  }

  onCommentChange = (e) => {
    this.setState({ comment: e.target.value })
  }

  onCommentLiked = (commentId) => {
    if (this.props.auth.isAuthenticated) {
      this.props.likeComment(commentId, this.props.auth.user.id)
    }
  }

  onPostSaved = (postId) => {
    if (this.props.auth.isAuthenticated) {
      this.props.savePost(postId, this.props.auth.user.id)
    }
  }

  render() {
    let page, paginationElement
    if (this.state.elements) {
      if (this.props.post.pageCount > 1) {
        paginationElement = (
          <ReactPaginate
            previousLabel={"← Previous"}
            nextLabel={"Next →"}
            breakLabel={<span className="gap">...</span>}
            pageCount={this.props.post.pageCount}
            onPageChange={this.handlePageClick}
            forcePage={this.state.currentPage}
            containerClassName={"pagination"}
            previousLinkClassName={"previous_page"}
            nextLinkClassName={"font-normal text-md text-gray-600"}
            disabledClassName={"disabled"}
            activeClassName={"active"}
          />
        );
      }
      let { username, content, createdAt, description, _id, saved } = this.props.post.post

      page = (
        <div className="">
          <div className="mb-16">
            <div className="flex items-center">
              <div className="font-semibold text-2xl text-tekno">
                {content}
              </div>
              <div onClick={() => this.onPostSaved(_id)} className="LikeBtn Btn items-center cursor-pointer ml-3">
                <span className="BtnWrapper items-center">
                  {/* <span className="Count mr-1">{saved.length}</span> */}
                  {saved.includes(this.props.auth.user.id) ? <i style={{ color: "#e0245e" }} className="fas fa-star"></i> : <i className="far fa-star"></i>}
                </span>
              </div>
            </div>
            <div className="flex mt-2">
              <div className="font-normal text-md text-gray-600">
                {description}
              </div>
            </div>
            <div className="flex items-center float-right">
              <div className="font-bold text-sm text-purple-900">
                {new Date(createdAt).toLocaleString()}
              </div>
              <div className="ml-4 font-normal text-sm text-black">
                {username.username}
              </div>
              <img
                src={username.avatar}
                alt={username.username}
                title={username.username}
                className="w-10 h-10 rounded-full mx-4"
              />
            </div>
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
        {this.props.auth.isAuthenticated ? <NewComment onCommentChange={this.onCommentChange} submitForm={this.onSubmitComment} comment={this.state.comment} loading={this.state.loading} /> : null}
        <div className="flex-1 mb-16 mt-6 text-center">
          {paginationElement}
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  auth: state.auth,
  post: state.posts.post,
});

export default withRouter(connect(mapStateToProps, { likeComment, savePost, fetchComments, submitComment, fetchSidePosts })(PostDetail));