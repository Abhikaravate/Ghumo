import {
  collection,
  addDoc,
  query,
  serverTimestamp,
  onSnapshot // Import onSnapshot for real-time updates
} from "firebase/firestore";

// Import the db instance directly from your firebase config file
import { db } from "./firebaseConfig"; 

/**
 * Saves a new search prompt to the user's history in Firestore.
 * @param {string} userId - The UID of the currently logged-in user.
 * @param {string} prompt - The search text submitted by the user.
 * @returns {Promise<void>}
 */
export const saveSearchToHistory = async (userId, prompt) => {
  if (!userId || !prompt) {
    console.error("User ID and prompt are required to save history.");
    return;
  }
  // Note: The collection path should be specific to the user for security
  const historyCollectionRef = collection(db, 'users', userId, 'history');
  try {
    await addDoc(historyCollectionRef, {
      userId: userId,
      prompt: prompt,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving search to history:", error);
    // Re-throw the error so it can be caught in the component
    throw new Error("Could not save search to history.");
  }
};

/**
 * Sets up a real-time listener for a user's search history.
 * @param {string} userId - The UID of the currently logged-in user.
 * @param {function} callback - A function to call with the updated history array.
 * @returns {function} - An unsubscribe function to detach the listener.
 */
export const onHistoryUpdate = (userId, callback) => {
  if (!userId) {
    // Return a no-op function if there's no user
    return () => {};
  }

  const historyCollectionRef = collection(db, 'users', userId, 'history');
  const q = query(historyCollectionRef);

  // onSnapshot returns an unsubscribe function automatically
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const history = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort the history by date on the client-side to avoid complex Firestore indexes
    history.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    callback(history);
  }, (error) => {
    console.error("Error fetching user history in real-time:", error);
    // Call the callback with an empty array in case of an error
    callback([]);
  });

  return unsubscribe;
};
