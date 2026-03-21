import axiosClient from '../configurations/axiosClient';

const API = {
  GET_ALL_USERS: '/user'
};

export const getAllUsers = async () => {
  const response = await axiosClient.get(API.GET_ALL_USERS);
  return response;
};
