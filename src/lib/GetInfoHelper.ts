import { TypeClassroom, TypeLocation, TypeSubject, TypeUser, useRootStore } from '@store/index';

function getUserInfo(user_id: number): TypeUser | undefined {
  return useRootStore.getState().users?.find((cl) => cl?.id == user_id);
}
function getClassroomInfo(classroom_id: number): TypeClassroom | undefined {
  return useRootStore.getState().classrooms?.find((cl) => cl?.id == classroom_id);
}

function getLocationInfo(location_id: number): TypeLocation | undefined {
  return useRootStore.getState().locations?.find((cl) => cl?.id == location_id);
}

function getSubjectInfo(subject_id: number): TypeSubject | undefined {
  return useRootStore.getState().subjects?.find((cl) => cl?.id == subject_id);
}

export { getClassroomInfo, getLocationInfo, getSubjectInfo, getUserInfo };
