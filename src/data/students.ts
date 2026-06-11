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

const STORAGE_KEY = "students_v2";

export const getStudents = (): Student[] => {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Failed to parse students", e);
      }
    }
    // Initialize LocalStorage if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_STUDENTS));
  }
  return MOCK_STUDENTS;
};

export { STORAGE_KEY };
