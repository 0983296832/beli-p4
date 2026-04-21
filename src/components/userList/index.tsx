import { PLUS_BLUE } from '@lib/ImageHelper';
import React from 'react';
import Tooltip from '../tooltip';

interface User {
  id: string;
  display_name: string;
  avatar: string;
}

interface UserListProps {
  users: User[];
  addFunction?: () => void;
}

const UserList: React.FC<UserListProps> = ({ users, addFunction }) => {
  return (
    <div className='flex items-center'>
      <div className='flex items-center -space-x-2'>
        {users?.slice(0, 4).map((user) => (
          <div key={user?.id} className='relative flex items-center'>
            <Tooltip description={user?.display_name}>
              <img
                src={user?.avatar}
                alt={user?.display_name}
                className='w-10 min-w-10 h-10 object-cover rounded-full border'
              />
            </Tooltip>
          </div>
        ))}
      </div>
      {users?.length > 4 && (
        <div className='flex items-center justify-center w-10 min-w-10 h-10  bg-gray-200 text-gray-800 rounded-full font-semibold ml-2 text-sm'>
          +{users?.length - 4}
        </div>
      )}
      {addFunction && (
        <div
          className='flex items-center justify-center w-10 min-w-10 h-10 hover:bg-primary-neutral-100 bg-white text-gray-800 rounded-full font-semibold border-2 border-dashed ml-3 cursor-pointer border-primary-blue-500'
          onClick={addFunction}
        >
          <img src={PLUS_BLUE} />
        </div>
      )}
    </div>
  );
};

export default UserList;
