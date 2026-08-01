import { User } from "constants/user";
import { createContext, useContext, useState } from "react";

type UserContextType = {
  userData: User;
  setUserData: React.Dispatch<React.SetStateAction<User>>;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState();

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUploads must be used within an UserProvider");
  }
  return context;
};