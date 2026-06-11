export interface Student {
  _id?: string;
  id: string;
  name: string;
  branch: string;
  instagramId: string;
  photoUrl: string;
  messageToBatch: string;
  favouriteMemory: string;
  bestFriend: string;
  editPassword?: string;
  /** Unique secret key assigned by admin — used to authenticate student submissions
   *  on the Signature Wall, Hall of Fame, and Time Capsules pages. */
  submissionKey?: string;
}

// Start with a clean slate for the real 70-75 students
export const MOCK_STUDENTS: Student[] = [];

export const getStudents = (): Student[] => {
  return MOCK_STUDENTS;
};
