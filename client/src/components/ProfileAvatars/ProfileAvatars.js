import React from 'react';

import { AVATARS } from '../../store/actions/types'

const ProfileAvatars = (props) => {
  return (
    <>
      {AVATARS.map(avatar => {
        return (
          <div key={avatar} onClick={() => props.change(avatar)} className="cursor-pointer">
            <img
              src={avatar}
              alt={avatar}
              className="w-12 h-12 rounded-full"
            />
          </div>
        )
      })}
    </>
  );
}

export default ProfileAvatars;