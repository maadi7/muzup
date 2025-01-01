import { User } from '@/types/Feed';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import Link from 'next/link';

interface LikeInfoProps {
    userIds: string[];
    isOpen: boolean;
    setIsOpen:Dispatch<SetStateAction<boolean>>
}

const LikeInfo: React.FC<LikeInfoProps> = ({ userIds, isOpen, setIsOpen }) => {
    const url = process.env.NEXT_PUBLIC_SERVER_URL;
    const [AllUser, setAllUser] = useState<User[]>([]);
    // const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchLikeByUsers = async () => {
            try {
                const userPromises = userIds.map((userId) =>
                    axios.get(`${url}/api/user/?userId=${userId}`).then((res) => res.data)
                );

                const users = await Promise.all(userPromises);
                setAllUser(users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchLikeByUsers();
    }, [userIds]);

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {/* <DialogTrigger asChild>
                    <button onClick={() => setIsOpen(true)}>Show Likes</button>
                </DialogTrigger> */}
                <DialogContent className="p-0 max-w-md">
                    <DialogTitle className="text-center border-b-2 w-full p-3">Likes</DialogTitle>
                    <ul className="px-4 pb-2 overflow-y-auto max-h-[30vh]">
                        {AllUser.map((user) => (
                            <li key={user._id} className="flex items-center justify-between my-2 p-2 rounded-lg ">
                                <div className="flex items-center space-x-4">
                                    <Link href={`/profile/${user._id}`}>
                                        <Image
                                            src={user.profilePic || '/default-profile.png'}
                                            alt={user.username}
                                            width={40}
                                            height={40}
                                            className="rounded-full cursor-pointer"
                                        />
                                    </Link>
                                    <Link href={`/profile/${user._id}`}>
                                        {user.username}
                                    </Link>
                                </div>
                                <Link href={`/profile/${user._id}`} >
                                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                                    view profile
                                </button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LikeInfo;
