// // import { useState } from 'react';
// // import UserList from './UserList'
// // import AddUser from './AddUser'
// // import "../../../styles/pages/management-pages.css"

// // const UserManagement = () => {
// //   const [selectedUser, setSelectedUser] = useState(null);

// //   const handleUserSelect = (user) => {
// //     setSelectedUser(user);
// //   };

// //   const handleOutsideClick = () => {
// //     setSelectedUser(null);
// //   };

// //   return (
// //     <div
// //       className="MobileBackgroundChange user-management-container md:h-full flex bg-white rounded-[20px] w-full h-full"
// //       onClick={handleOutsideClick}
// //     >
// //       <div className="md:p-none p-[1rem] shadow-md flex flex-col md:flex-row gap-2 lg:gap-0 h-full w-full rounded-[20px]">
// //         <UserList 
// //           onUserSelect={handleUserSelect}
// //           selectedUser={selectedUser}
// //         />

// //         {/* Center Divider */}
// //         <div className="hidden lg:block w-px bg-[#E5E7EB]"></div>
// //         <AddUser className="AddPage user-add-section" selectedUser={selectedUser} />
// //       </div>
// //     </div>
// //   )
// // }

// // export default UserManagement



// import { useState } from 'react';
// import UserList from './UserList';
// import AddUser from './AddUser';

// const UserManagement = () => {
//   const [selectedUser, setSelectedUser] = useState(null);

//   const handleUserSelect = (user) => {
//     setSelectedUser(user);
//   };

//   const handleOutsideClick = () => {
//     setSelectedUser(null);
//   };

//   return (
//     <div
//       className="flex flex-col md:flex-row w-full h-full bg-white rounded-[20px] shadow-md gap-3 lg:gap-0 p-3 sm:p-5 overflow-y-auto md:overflow-hidden"
//       onClick={handleOutsideClick}
//     >
//       {/* User List column - exactly half width on md+, full width on mobile */}
//       <div className="w-full md:w-1/2 md:h-full min-w-0">
//         <UserList onUserSelect={handleUserSelect} selectedUser={selectedUser} />
//       </div>

//       {/* Center divider, desktop only */}
//       <div className="hidden lg:block w-px bg-[#E5E7EB] mx-3"></div>

//       {/* Add User column - exactly half width on md+, full width on mobile */}
//       <div className="w-full md:w-1/2 md:h-full min-w-0">
//         <AddUser selectedUser={selectedUser} />
//       </div>
//     </div>
//   );
// };

// export default UserManagement;

import { useState } from 'react';
import UserList from './UserList';
import AddUser from './AddUser';

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
    className="flex flex-col md:flex-row w-full h-full min-h-0 bg-white rounded-[20px] shadow-md gap-3 lg:gap-0 p-3 sm:p-4 overflow-hidden"
    onClick={handleOutsideClick}
  >
    <div className="w-full md:w-1/2 md:h-full min-h-0 min-w-0 overflow-hidden">
      <UserList onUserSelect={handleUserSelect} selectedUser={selectedUser} />
    </div>

    <div className="hidden lg:block w-px bg-[#E5E7EB] mx-3"></div>

    <div className="w-full md:w-1/2 md:h-full min-h-0 min-w-0 overflow-hidden">
      <AddUser selectedUser={selectedUser} />
    </div>
  </div>
  );
};

export default UserManagement;