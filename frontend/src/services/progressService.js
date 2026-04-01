import axiosClient from '../configurations/axiosClient';

const API = {
    PROGRESS: '/progress'
};

export const getMyProgress = async (courseId) => {
    const response = await axiosClient.get(`${API.PROGRESS}/${courseId}/my-progress`);
    return response;
};

export const getClassProgress = async (courseId) => {
    const response = await axiosClient.get(`${API.PROGRESS}/${courseId}/class`);
    return response;
};
