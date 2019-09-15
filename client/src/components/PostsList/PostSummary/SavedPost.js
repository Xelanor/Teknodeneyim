import React from 'react';
import { Link } from "react-router-dom";

const savedPost = (props) => {
  return (
    <div className="flex-1 mb-8">
      <div className="flex items-center">
        <Link to={`/post/${props.id}`}>
          <div className="font-semibold text-2xl text-tekno">
            {props.content}
          </div>
        </Link>
        <div onClick={() => props.onPostSaved(props.id)} className="LikeBtn Btn items-center cursor-pointer ml-3">
          <span className="BtnWrapper items-center">
            {/* <span className="Count mr-1">{props.Datesaved.length}</span> */}
            {props.saved.includes(props.user._id) ? <i style={{ color: "#e0245e" }} className="fas fa-star"></i> : <i className="far fa-star"></i>}
          </span>
        </div>
      </div>
      <div className="flex mt-2">
        <div className="font-normal text-md text-gray-600">
          {props.description}
        </div>
      </div>
      <div className="flex items-center float-right">
        <div className="font-bold text-sm text-purple-900">
          {new Date(props.createdAt).toLocaleString()}
        </div>
        <div className="ml-4 font-normal text-sm text-black">
          {props.user.username}
        </div>
        <img
          src={props.user.avatar}
          alt={props.user.username}
          title={props.user.username}
          className="w-10 h-10 rounded-full mx-4"
        />
      </div>
    </div>
  );
}

export default savedPost;