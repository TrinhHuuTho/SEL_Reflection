import axiosClient from '../configurations/axiosClient';

const API = {
  COURSES: '/courses'
};

export const getCourses = async (classId) => {
    const url = classId ? `${API.COURSES}?classId=${classId}` : API.COURSES;
    const response = await axiosClient.get(url);
    return response;
};

export const getCourseById = async (id) => {
    const response = await axiosClient.get(`${API.COURSES}/${id}`);
    return response;
};

export const createCourse = async (courseData) => {
  const response = await axiosClient.post(API.COURSES, courseData);
  return response;
};
