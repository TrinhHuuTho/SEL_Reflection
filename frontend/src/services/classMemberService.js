import axiosClient from '../configurations/axiosClient';

const API = {
  GET_MEMBERS: '/class-member/members/',
  ADD_MEMBER: '/class-member/add',
  REMOVE_MEMBER: '/class-member/remove/',
  GET_AVAILABLE: '/class-member/available/',
  GET_MY_CLASSES: '/class-member/my-classes'
};

export const getMembersByClass = async (classId) => {
  const res = await axiosClient.get(API.GET_MEMBERS + classId);
  return res;
};

export const addStudentToClass = async (classId, studentId) => {
  const res = await axiosClient.post(API.ADD_MEMBER, { classId, studentId });
  return res;
};

export const removeStudentFromClass = async (classId, studentId) => {
  const res = await axiosClient.delete(`${API.REMOVE_MEMBER}${classId}/${studentId}`);
  return res;
};

export const getAvailableStudents = async (centerId, classId) => {
  const res = await axiosClient.get(`${API.GET_AVAILABLE}${centerId}/${classId}`);
  return res;
};

export const getMyClasses = async () => {
  const res = await axiosClient.get(API.GET_MY_CLASSES);
  return res;
};
