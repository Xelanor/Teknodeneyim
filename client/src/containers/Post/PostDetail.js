import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactPaginate from 'react-paginate'
import { withRouter } from 'react-router-dom'
import { MenuItem, Modal } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios'
import { Helmet } from "react-helmet";

import Spinner from '../../components/UI/Spinner/Spinner'
import NewComment from '../../components/Comments/Comment/NewComment'
import Comments from '../../components/Comments/Comments'
import ActionsModal from '../Modals/ActionsModal'
// import Tooltip from '../../components/UI/Tooltip/Tooltip'

import { likeComment, savePost } from '../../store/actions/likeAction'
import { fetchComments, submitComment, fetchSidePosts } from '../../store/actions/fetchActions'
import { COMMENT_PER_PAGE, MAX_COMMENT_CHARACTHERS, NEXT_COMMENT_TIME, BAD_WORDS } from '../../store/actions/types'
import timeAgo from '../../utils/timeAgo'
import Filter from '../../utils/badwords'

import './PostDetail.css'

class PostDetail extends Component {
  state = {
    comment: "",
    currentPage: 0,
    offset: 0,
    elements: null,
    loading: false,
    numChar: 0,
    ringStyle: {
      stroke: "",
      strokeDasharray: ""
    },
    modalVisible: false,
    // modalType: "",
    // displayInfo: false
  }

  StyledMenuItem = withStyles(theme => ({
    root: {
      minHeight: '10px',
      fontSize: '0.8rem',
    },
  }))(MenuItem);

  componentDidUpdate(prevProps, prevState) {
    if (this.props.post !== prevProps.post) {
      this.setElementsForCurrentPage()
    }
    if (prevProps.match.params.slug !== this.props.match.params.slug) {
      this.props.fetchComments(this.props.match.params.slug)
    }
  }

  componentDidMount() {
    this.props.fetchComments(this.props.match.params.slug)
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
    let userComment = this.state.comment
    userComment = Filter(BAD_WORDS, userComment)
    let comment = {
      username: this.props.auth.user.id,
      content: userComment,
      target: this.props.post.post._id
    }
    let lastCommented = ""
    await axios.get('/users/report/' + this.props.auth.user.id)
      .then(res => { lastCommented = res.data.lastCommented ? res.data.lastCommented : null })
      .catch(err => { console.log(err) })
    lastCommented = new Date(lastCommented).getTime()
    let now_plus_time = Date.now() - NEXT_COMMENT_TIME * 60000 // Minute to hours
    if (now_plus_time >= lastCommented || lastCommented == null || this.props.auth.user.role == "admin") {
      await this.props.submitComment(comment)
      this.setState({ comment: "" })
      this.props.fetchComments(this.props.match.params.slug)
      this.setState({ loading: false })
      window.scrollTo(0, 0)
      this.props.fetchSidePosts()
    } else {
      await this.handleModalShow('comment-not-submitted', true)
      this.setState({ loading: false })
    }
  }

  onCommentChange = (e) => {
    this.setState({ comment: e.target.value, numChar: e.target.value.length })
    this.styleRing(e.target.value.length)
  }

  onCommentLiked = (commentId) => {
    if (this.props.auth.isAuthenticated) {
      this.props.likeComment(commentId, this.props.auth.user.id)
    } else {
      this.props.history.push("/login")
    }
  }

  onPostSaved = (postId) => {
    if (this.props.auth.isAuthenticated) {
      this.props.savePost(postId, this.props.auth.user.id)
    } else {
      this.props.history.push("/login")
    }
  }

  handleModalShow = (modalType, show) => {
    this.setState({ modalType, modalVisible: show })
  };

  styleRing = (numChar) => {
    const r = 15;
    const circleLength = 2 * Math.PI * r;
    const teknoColor = "#F67E7D"

    let colored = (circleLength * numChar) / MAX_COMMENT_CHARACTHERS;
    let gray = circleLength - colored > 0 ? circleLength - colored : 0

    this.setState((state) => ({
      ringStyle: {
        stroke: (MAX_COMMENT_CHARACTHERS - numChar) <= 0 ? "red" :
          (MAX_COMMENT_CHARACTHERS - numChar) <= 100 ? "orange" :
            teknoColor,
        strokeDasharray: `${colored} ${gray}`
      }
    }));
  }

  // hoverOn = () => {
  //   this.setState({ displayInfo: true })
  // }

  // hoverOff = () => {
  //   this.setState({ displayInfo: false })
  // }

  render() {
    let page, paginationElement
    if (this.state.elements) {
      if (this.props.post.pageCount > 1) {
        paginationElement = (
          <ReactPaginate
            previousLabel={"Geri"}
            nextLabel={"İleri"}
            breakLabel={<span className="gap">...</span>}
            pageCount={this.props.post.pageCount}
            onPageChange={this.handlePageClick}
            forcePage={this.state.currentPage}
            containerClassName={"pagination p-2 leading-tight text-tekno"}
            previousLinkClassName={"block p-2 font-bold leading-tight text-tekno"}
            nextLinkClassName={"block p-2 font-bold leading-tight text-tekno"}
            disabledClassName={"disabled"}
            activeClassName={"active font-bold"}
          />
        );
      }
      let { content, createdAt, description, _id, saved } = this.props.post.post

      page = (
        <div className="">
          <Helmet>
            <meta charSet="utf-8" />
            <title>{content} - Teknodeneyim</title>
            <meta name="description" content={description} />
          </Helmet>
          <div className="mb-12">
            <div className="flex items-center">
              <div className="font-semibold text-2xl text-tekno">
                {content}
              </div>
              {/* <Tooltip message={'asdasfasfasfa'} position={'bottom'}><i style={{ color: "#e0245e" }} className="fas fa-star"></i></Tooltip> */}
              <div onClick={() => this.onPostSaved(_id)} className="LikeBtn Btn items-center cursor-pointer ml-3">
                <span className="BtnWrapper items-center">
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
                Konu açılış tarihi: {timeAgo(new Date(createdAt).getTime())}
              </div>
            </div>
          </div>
          <div className="flex-1 mb-2 mt-2 text-right">
            {paginationElement}
          </div>
          <Comments
            comments={this.state.elements}
            commentLike={this.onCommentLiked}
            postId={this.props.match.params.slug}
            user={this.props.auth.isAuthenticated ? this.props.auth.user.id : ""}
          />
          {this.props.auth.isAuthenticated ?
            <NewComment
              onCommentChange={this.onCommentChange}
              submitForm={this.onSubmitComment}
              comment={this.state.comment}
              loading={this.state.loading}
              numChar={this.state.numChar}
              ringStyle={this.state.ringStyle}
              maxChar={MAX_COMMENT_CHARACTHERS}
            />
            : null}
        </div>
      )
    } else {
      page = <Spinner />
    }
    return (
      <div className="flex-1 px-4 mb-16 mt-4 items-center">
        {page}
        <div className="flex-1 w-full mb-8 mt-2 text-right float-right">
          {paginationElement}
        </div>
        <Modal
          open={this.state.modalVisible}
          aria-labelledby="post modal"
          aria-describedby="create comment modal"
          className="modal-wrapper"
          onClose={() => this.setState({ modalVisible: false })}
        >
          <ActionsModal
            modalShow={this.handleModalShow}
            modalType={this.state.modalType}
          />
        </Modal>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  auth: state.auth,
  post: state.posts.post,
});

export default withRouter(connect(mapStateToProps, { likeComment, savePost, fetchComments, submitComment, fetchSidePosts })(PostDetail));