import axiosClient from '../configurations/axiosClient';

const API = {
  GET_ALL_CENTERS: '/center',
  CREATE_CENTER: '/center',
  GET_MY_CENTER: '/user-center/my-center',
  JOIN_CENTER: '/user-center/join'
};

export const getAllCenters = async () => {
  const response = await axiosClient.get(API.GET_ALL_CENTERS);
  return response;
};

export const createCenter = async (centerData) => {
  const response = await axiosClient.post(API.CREATE_CENTER, centerData);
  return response;
};

export const getMyCenter = async () => {
  const response = await axiosClient.get(API.GET_MY_CENTER);
  return response;
};

export const joinCenter = async (centerId) => {
  const response = await axiosClient.post(API.JOIN_CENTER, { centerId });
  return response;
};
