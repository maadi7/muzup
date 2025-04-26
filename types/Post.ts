export interface Reply {
  _id: string;
  userId: string;
  name: string;
  text: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
}
export interface Comment {
  _id: string;
  userId: string;
  name: string;
  text: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
}
export interface Post {
  _id: string;
  userId: string;
  caption: string;
  img: string;
  likes: string[];
  songId?: string;
  comments: Comment[];
}
