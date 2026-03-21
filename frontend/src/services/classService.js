import axiosClient from '../configurations/axiosClient';

const API = {
  GET_CLASSES: '/class',
  CREATE_CLASS: '/class',
  GET_CLASS_BY_ID: '/class/', // + id
  UPDATE_CLASS: '/class/',    // + id
  DELETE_CLASS: '/class/'     // + id
};

export const getClasses = async (params) => {
  const response = await axiosClient.get(API.GET_CLASSES, { params });
  return response;
};

export const createClass = async (classData) => {
  const response = await axiosClient.post(API.CREATE_CLASS, classData);
  return response;
};

export const getClassById = async (id) => {
  const response = await axiosClient.get(API.GET_CLASS_BY_ID + id);
  return response;
};

export const updateClass = async (id, updates) => {
  const response = await axiosClient.put(API.UPDATE_CLASS + id, updates);
  return response;
};

export const deleteClass = async (id) => {
  const response = await axiosClient.delete(API.DELETE_CLASS + id);
  return response;
};
