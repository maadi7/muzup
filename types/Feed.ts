interface Comments{
    id: string;
    name: string;
    text: string;
}

interface Stories{
    img: string;
    songId: string | null;
}

export interface Post{
    _id: string;
    userId: string;
    caption: string | null;
    img: string;
    likes: Array<string>;
    songId: string | null;
    comments: Array<Comments> | null;
}

export interface StoryInfo{
    _id:string;
    userId: string;
    username: string;
    stories: Array<Stories> | null;
}
export type User = {
    _id: string;
    username: string;
    email: string;
    birthdate: Date;
    profilePic: string;
    topArtists: Array<any>;
    topTracks:  Array<any>;
    recentlyPlayed:  Array<any>;
    createdAt: Date;
    updatedAt: Date;
    followers:  Array<string>;
    followings:  Array<string>;
    pendingRequests: Array<string>;
    requestedTo: Array<string>;
};

export interface PostComment{
    
    userId: string;
    text: string;
    name: string;
    _id: string;    
    createdAt: string
}