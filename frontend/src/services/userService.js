import axiosClient from '../configurations/axiosClient';

const API = {
  GET_ALL_USERS: '/user',
  USER_INFO: '/user/information',
  UPDATE_PROFILE: '/user/change-information'
};

// Helper function to parse avatar if it's a JSON string
const parseAvatarData = (user) => {
  if (user && user.avatar && typeof user.avatar === 'string') {
    try {
      const parsed = JSON.parse(user.avatar);
      return { ...user, avatar: parsed };
    } catch (e) {
      // If parsing fails, keep avatar as string (it's a URL or file path)
      return user;
    }
  }
  return user;
};

export const getAllUsers = async () => {
  const response = await axiosClient.get(API.GET_ALL_USERS);
  return response;
};

export const getUserInfo = async () => {
  const response = await axiosClient.get(API.USER_INFO);
  // Parse avatar JSON if needed
  if (response.success && response.data) {
    response.data = parseAvatarData(response.data);
  }
  return response;
};

export const updateUserAvatar = async (avatarData) => {
  // avatarData có thể là object (avatar selector result) hoặc string (path to image)
  const payload = typeof avatarData === 'object' ? { avatar: JSON.stringify(avatarData) } : { avatar: avatarData };
  
  const response = await axiosClient.put(API.UPDATE_PROFILE, payload);
  return response;
};

export const updateUserProfile = async (profileData) => {
  const response = await axiosClient.put(API.UPDATE_PROFILE, profileData);
  return response;
};
