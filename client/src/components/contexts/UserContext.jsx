import { createContext, useEffect, useState, useRef } from "react";
export const userContextObj = createContext();

function UserContext({ children }) {
  const [currentUser, setCurrentUserState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImageUrl: "",
    baseID: "",
    isVerified: false,
  });

  // Add a ref to track initial load
  const initialLoadComplete = useRef(false);

  // Load from localStorage on initial render only - this approach is correct
  useEffect(() => {
    if (!initialLoadComplete.current) {
      const userInStorage = localStorage.getItem("currentuser");
      if (userInStorage) {
        try {
          setCurrentUserState(JSON.parse(userInStorage));
        } catch (err) {
          console.error("Error parsing user from localStorage:", err);
          localStorage.removeItem("currentuser");
        }
      }
      initialLoadComplete.current = true;
    }
  }, []);

  // Custom setter function that also updates localStorage
  const setCurrentUser = (newUserData) => {
    // If newUserData is null, clear the user data
    if (newUserData === null) {
      setCurrentUserState({
        firstName: "",
        lastName: "",
        email: "",
        profileImageUrl: "",
        baseID: "",
        isVerified: false,
      });
      localStorage.removeItem("currentuser");
      return;
    }

    // Handle both function and object updates
    const updatedUser =
      typeof newUserData === "function"
        ? newUserData(currentUser)
        : { ...currentUser, ...newUserData };

    // Ensure baseID is preserved if it exists
    if (currentUser.baseID && !updatedUser.baseID) {
      updatedUser.baseID = currentUser.baseID;
      console.warn("Preserved baseID that was about to be lost in update");
    }

    // Don't update if nothing changed (prevents unnecessary re-renders)
    if (JSON.stringify(updatedUser) === JSON.stringify(currentUser)) {
      return;
    }

    // Update state
    setCurrentUserState(updatedUser);

    // Update localStorage
    localStorage.setItem("currentuser", JSON.stringify(updatedUser));
  };

  return (
    <userContextObj.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </userContextObj.Provider>
  );
}

export default UserContext;
