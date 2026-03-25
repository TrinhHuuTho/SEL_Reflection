import axiosClient from '../configurations/axiosClient';

const API = {
  NODES: '/nodes',
  REORDER: '/nodes/reorder'
};

export const getNodesByCourse = async (courseId) => {
    return await axiosClient.get(`${API.NODES}?courseId=${courseId}`);
};

export const createNode = async (nodeData) => {
    return await axiosClient.post(API.NODES, nodeData);
};

export const updateNode = async (id, nodeData) => {
    return await axiosClient.put(`${API.NODES}/${id}`, nodeData);
};

export const deleteNode = async (id) => {
    return await axiosClient.delete(`${API.NODES}/${id}`);
};

export const updateNodesOrder = async (courseId, nodes) => {
    return await axiosClient.post(API.REORDER, { courseId, nodes });
};
