import React from 'react';

import HomepagePost from './PostSummary/HomepagePost'

const homepagePosts = (props) => {
  let data = props.posts
  let posts = data.map(post => {
    return <HomepagePost
      key={post._id}
      id={post._id}
      username={post.username}
      content={post.content}
      description={post.description}
      subjects={post.subjects}
      createdAt={post.createdAt}
      comments={post.comments}
      commentLike={props.commentLike}
      user={props.user}
    />
  })
  return (
    <div className="flex-1 px-4 py-10">
      <div className="flex mb-4">
        <div className="font-bold text-3xl text-purple-900">
          En Güncel Deneyimler
        </div>
      </div>
      <div>
        {posts}
      </div>
    </div>
  );
}

export default homepagePosts;