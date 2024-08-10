import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = {
    _id: string;
    username: string;
    email: string;
    birthdate: Date;
    profilePic: string;
    topArtists: any;
    topTracks: any;
    recentlyPlayed: any;
    createdAt: Date;
    updatedAt: Date;
    followers: any;
    followings: any;
    pendingRequests: any;
    requestedTo: any;
};

export type SpotifySession = {
    accessToken: string;
    expiresAt: string;
    user: {
        email: string;
        image: string;
        name: string;
    };
};

export type State = {
    user: User | null;
    spotifySession: SpotifySession | null;
};

export type Actions = {
    addUser: (user: User) => void;
    removeUser: () => void;
    setSpotifySession: (session: SpotifySession) => void;
    clearSpotifySession: () => void;
};

export const useUserStore = create<State & Actions>()(
    persist(
        (set) => ({
            user: null,
            spotifySession: null,
            addUser: (user: User) => {
                console.log("User saved in Zustand:", user);
                set((state) => ({
                    user: user,
                }));
            },
            removeUser: () =>
                set(() => ({
                    user: null,
                })),
            setSpotifySession: (session: SpotifySession) => {
                console.log("Spotify session saved in Zustand:", session);
                set((state) => ({
                    spotifySession: session,
                }));
            },
            clearSpotifySession: () =>
                set(() => ({
                    spotifySession: null,
                })),
        }),
        {
            name: 'user-store',
            onRehydrateStorage: () => (state) => {
                console.log("Rehydrating state:", state);
            },
        }
    )
);
