import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Plus, User, Bell } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('feeds');
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem('users')) || [];
  });
  const [posts, setPosts] = useState(() => {
    return JSON.parse(localStorage.getItem('posts')) || [];
  });
  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem('notifications')) || [];
  });
  const [searchBloodType, setSearchBloodType] = useState('');
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  });
  const [sortOrder, setSortOrder] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [postType, setPostType] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    bloodType: '',
    phone: '',
    hospitalName: '',
    bodyCondition: '',
    certificate: null,
  });
  // Save all data to localStorage
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('posts', JSON.stringify(posts));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [users, posts, notifications, currentUser]);

  const isCompatible = (donor, recipient) => {
    const compatibilityMap = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-'],
    };
  
    return compatibilityMap[recipient]?.includes(donor);
  };

  const getBloodGroupSummary = () => {
    const summary = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    };
  
  
    posts.forEach((post) => {
      if (post.type === 'donor' && summary[post.bloodType] !== undefined) {
        summary[post.bloodType]++;
      }
    });
  
    return summary;
  };
  

  // Interest submission handler
  
  const DeletePost = (e) => {
    const updatedPosts = posts.filter(post => post.timestamp !== e.timestamp);
    setPosts(updatedPosts);
  }

  const DeleteNotification = (e) => {
    const updatedNotifications = notifications.filter(notification => notification.timestamp !== e.timestamp);
    setNotifications(updatedNotifications);
  }
  const handleInterestSubmit = (e) => {
    e.preventDefault();
    const newInterest = {
      postId: selectedPost.id,
      interestedUser: currentUser.username,
      name: formData.name,
      phone: formData.phone,
      ...(currentUser.userType === 'donor' && { bodyCondition: formData.bodyCondition }),
      ...(currentUser.userType === 'requestor' && { hospitalName: formData.hospitalName }),
      timestamp: new Date().toISOString()
    };

    // Create notification for post owner
    const newNotification = {
      id: Date.now(),
      postId: selectedPost.id,
      postType: selectedPost.type,
      toUser: selectedPost.username,
      fromUser: currentUser.username,
      interestDetails: newInterest,
      read: false,
      timestamp: new Date().toISOString()
    };

    setNotifications([newNotification, ...notifications]);
    setModalType('');
    setSelectedPost(null);
    clearForm();
    alert('Interest submitted successfully!');
  };
  
  const unreadNotificationsCount = notifications.filter(
    n => n.toUser === currentUser?.username && !n.read
  ).length;

  const handleSignup = (e) => {
    e.preventDefault();
    const otp = Math.floor(1000 + Math.random() * 9999).toString();
    setGeneratedOtp(otp);
    setIsVerifyingOtp(true);
    alert('Your OTP is: ${otp}');
    const newUser = {
      username: formData.username,
      password: formData.password
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setModalType('');
    clearForm();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => 
      u.username === formData.username && u.password === formData.password
    );
    if (user) {
      setCurrentUser(user);
      setModalType('');
      clearForm();
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('feeds');
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    const newPost = {
      type: postType,
      name: formData.name,
      bloodType: formData.bloodType,
      phone: formData.phone,
      hospitalName: postType === 'requestor' ? formData.hospitalName : '',
      certificate: formData.certificate?.name || '',
      username: currentUser.username,
      timestamp: new Date().toISOString()
    };
    setPosts([newPost, ...posts]);
    setModalType('');
    setPostType('');
    clearForm();
  };

  const clearForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      bloodType: '',
      phone: '',
      hospitalName: '',
      certificate: null,
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-100 to-red-700 p-4">


      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">Blood Donation Network</h1>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2"
              >
                <Bell className="w-6 h-6"/>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {currentUser.username}
              </span>
              <button onClick={handleLogout} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )
           : (
            <div className="flex gap-4">
              <button
                onClick={() => setModalType('login')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => setModalType('signup')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </header>

        {/* Navigation tabs */}
        {currentUser && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setModalType('new')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            <button
              onClick={() => setActiveTab('feeds')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'feeds' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Feeds
            </button>
            {/* <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'notifications' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Notifications
            </button> */}
          </div>
        )}
  {/* Notifications Tab Content */}
  {currentUser && activeTab === 'notifications' && (
          <div className="grid gap-4">
            {notifications
              .filter(notification => notification.toUser === currentUser.username)
              .map((notification) => (
                <div 
                  key={notification.id}
                  className={`bg-white p-6 rounded-lg shadow ${
                    !notification.read ? 'border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">New Interest!</h3>
                      <p className="text-gray-600">
                        {notification.fromUser} is interested in your {notification.postType} post
                      </p>
                    </div>
                    {!notification.read && (
                      <>
                       <button onClick={() => {DeleteNotification(notification);}} className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        Delete
                      </button>
                      </>
                      
                    )}
                  </div>
                  <div className="grid gap-2">
                    <p><strong>Name:</strong> {notification.interestDetails.name}</p>
                    <p><strong>Phone:</strong> {notification.interestDetails.phone}</p>
                    {notification.interestDetails.bodyCondition && (
                      <p><strong>Body Condition:</strong> {notification.interestDetails.bodyCondition}</p>
                    )}
                    {notification.interestDetails.hospitalName && (
                      <p><strong>Hospital:</strong> {notification.interestDetails.hospitalName}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Received: {new Date(notification.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Feeds with Interest Button */}
        {currentUser && activeTab === 'feeds' && (
          <div className="grid gap-4">
            <div className="mb-4 flex justify-between items-center">
              <label className="text-sm text-gray-700 font-medium">
              Sort by: </label><div className="flex gap-2">
              <button onClick={() => setSortOrder('newest')}className={`px-3 py-1 rounded ${
              sortOrder === 'newest' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Newest</button>
              <button onClick={() => setSortOrder('oldest')} className={`px-3 py-1 rounded ${
              sortOrder === 'oldest' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Oldest</button>
            </div>
          </div>

            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <h3 className="font-semibold text-red-800 mb-2 text-lg">🩸 Blood Group Summary</h3>
              <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                {Object.entries(getBloodGroupSummary()).map(([group, count]) => (
                <span key={group} className="px-3 py-1 rounded-full bg-white border border-gray-300 shadow-sm">
                {group}: <span className="font-medium text-red-600">{count}</span> </span> ))}
              </div>
            </div>


            <div className="mb-4">
              <input type="text" placeholder="Search by Blood Group (e.g., O+)" value={searchBloodType} 
              onChange={(e) => setSearchBloodType(e.target.value.toUpperCase())}
              className="w-full p-2 border rounded"/> </div>

            {posts
              .filter((post) =>
              searchBloodType ? post.bloodType.includes(searchBloodType) : true)
              .sort((a, b) => {
              const dateA = new Date(a.timestamp);
              const dateB = new Date(b.timestamp);
              return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            })
            .map((post) => (


              <div 
                key={post.id}
                className={`bg-white p-6 rounded-lg shadow ${
                  post.type === 'donor' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                }`}
              >
               {post.type === 'donor' && searchBloodType && (<div className={`text-sm font-semibold mb-2 ${
                  isCompatible(post.bloodType, searchBloodType) ? 'text-green-600': 'text-red-500'}`}>
                  {isCompatible(post.bloodType, searchBloodType)? '✅ Compatible Donor': '❌ Not Compatible'}  </div>
                )}

                {/* Existing post content */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{post.name}</h3>
                    <p className="text-gray-600">
                      {post.type === 'donor' ? 'Willing to Donate' : 'Requesting'} {post.bloodType}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    post.type === 'donor' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {post.type === 'donor' ? 'Donor' : 'Requestor'}
                  </span>
                </div>
                <div className="grid gap-2">
                  <p><strong>Phone:</strong> {post.phone}</p>
                  {post.type === 'requestor' && (
                    <p><strong>Hospital:</strong> {post.hospitalName}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Posted by: {post.username} • {new Date(post.timestamp).toLocaleDateString()}
                  </p>
                  
                  {/* Interest Button - only show if not the post owner */}
                  {post.username !== currentUser.username ? (
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setModalType('interest');
                      }}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      I'm Interested
                    </button>
                  ) : 
                  <>
                   <button
                      onClick={() => {
                        DeletePost(post);
                      }}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                    </>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interest Form Modal */}
        {modalType === 'interest' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg w-96">
              <h2 className="text-2xl font-bold mb-4">Express Interest</h2>
              <form onSubmit={handleInterestSubmit}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />
                {currentUser.userType === 'donor' && (
                  <textarea
                    placeholder="Your Current Body Condition"
                    value={formData.bodyCondition}
                    onChange={(e) => setFormData({...formData, bodyCondition: e.target.value})}
                    className="w-full mb-4 p-2 border rounded"
                    required
                  />
                )}
                {currentUser.userType === 'requestor' && (
                  <input
                    type="text"
                    placeholder="Hospital Name"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                    className="w-full mb-4 p-2 border rounded"
                    required
                  />
                )}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('');
                      setSelectedPost(null);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Submit Interest
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Authentication Modals */}
        {(modalType === 'login' || modalType === 'signup') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg w-96">
              <h2 className="text-2xl font-bold mb-4">
                {modalType === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <form onSubmit={modalType === 'login' ? handleLogin : handleSignup}>            
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />
                {isVerifyingOtp && (
                <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP sent to your phone</label>
                <input type="text"value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} className="w-full p-2 border rounded mb-2"/>
                <button className="w-full bg-blue-500 text-white py-2 rounded"
                  onClick={() => {
                      if (enteredOtp === generatedOtp) {
                        const newUser = {
                          username: formData.username,
                          password: formData.password,
                          phone: formData.phone,
                          verified: true,
                        };
                        setUsers([...users, newUser]);
                        setCurrentUser(newUser);
                        setModalType('');
                        clearForm();
                        setIsVerifyingOtp(false);
                        setGeneratedOtp('');
                        setEnteredOtp('');
                      } else {
                        alert("Incorrect OTP. Try again.");
                      }}}>Verify OTP</button> 
                  </div>)}

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setModalType('')}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    {modalType === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* New Post Type Selection Modal */}
        {modalType === 'new' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg w-96">
              <h2 className="text-2xl font-bold mb-4">I want to:</h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setPostType('donor');
                    setModalType('form');
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Donate Blood
                </button>
                <button
                  onClick={() => {
                    setPostType('requestor');
                    setModalType('form');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Request Blood
                </button>
                <button
                  onClick={() => setModalType('')}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Form Modal */}
        {modalType === 'form' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg w-96">
              <h2 className="text-2xl font-bold mb-4">
                {postType === 'donor' ? 'Donate Blood' : 'Request Blood'}
              </h2>
              <form onSubmit={handleSubmitPost}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                  className="w-full mb-4 p-2 border rounded"
                  required
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />
                {postType === 'requestor' && (
                  <input
                    type="text"
                    placeholder="Hospital Name"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                    className="w-full mb-4 p-2 border rounded"
                    required
                  />
                )}
                {postType === 'donor' && (<div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Medical Certificate (PDF/JPG/PNG)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) =>setFormData({ ...formData, certificate: e.target.files[0] })}
                  required className="w-full p-2 border rounded"/>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('');
                      setPostType('');
                    }}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Welcome message when not logged in */}
        {!currentUser && (
        <div className="text-center p-10 bg-white/90 rounded-xl shadow-lg max-w-xl mx-auto mt-20">
          <h2 className="text-3xl font-bold mb-4 text-red-600">Welcome to HemoSync ❤️</h2>
          <p className="text-gray-700 text-base"> Saving lives made simpler. Join our network of blood donors and recipients.
          <br /> Please <span className="font-semibold text-red-500">Login</span> or <span className="font-semibold text-red-500">Sign Up</span> to get started.</p>
        </div>
        )}
      </div>
    </div>
  );
};

export default App;