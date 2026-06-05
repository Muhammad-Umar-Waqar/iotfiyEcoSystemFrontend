import { useState } from 'react';
import UserList from './UserList'
import AddUser from './AddUser'
import "../../../styles/pages/management-pages.css"

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleOutsideClick = () => {
    setSelectedUser(null);
  };

  return (
    <div
      className="MobileBackgroundChange user-management-container md:h-full flex bg-white rounded-[20px] w-full h-full"
      onClick={handleOutsideClick}
    >
      <div className="md:p-none p-[1rem] shadow-md flex flex-col lg:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]">
        <UserList className="ListPage user-list-section"
          onUserSelect={handleUserSelect}
          selectedUser={selectedUser}
        />

        {/* Center Divider */}
        <div className="hidden lg:block w-px bg-[#E5E7EB]"></div>
        <AddUser className="AddPage user-add-section" selectedUser={selectedUser} />
      </div>
    </div>
  )
}

export default UserManagement
