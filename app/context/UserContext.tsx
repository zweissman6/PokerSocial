import React, { createContext, ReactNode, useContext, useState } from 'react';

type User = {
  _id: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatar: string;
  favoriteCardroom: string;
  following: string[];
  followers: string[];
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}
