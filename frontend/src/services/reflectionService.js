import axiosClient from '../configurations/axiosClient';

const API = {
  REFLECTIONS: '/reflections',
};

export const createReflection = async (data) => {
    return await axiosClient.post(API.REFLECTIONS, data);
};

export const getReflectionsByNode = async (nodeId) => {
    return await axiosClient.get(`${API.REFLECTIONS}/node/${nodeId}`);
};

export const updateReflectionById = async (id, data) => {
    return await axiosClient.patch(`${API.REFLECTIONS}/${id}`, data);
};

export const deleteReflectionById = async (id) => {
    return await axiosClient.delete(`${API.REFLECTIONS}/${id}`);
};
