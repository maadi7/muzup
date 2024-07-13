"use client"

import React, { useState } from 'react';

const Navbar = () => {
    const [toggle, setToggle] = useState<boolean>(false);
    
    const toggleMenu = () => {
        setToggle(!toggle);
    };

    return (
        <nav className='flex justify-between items-center py-8 px-24 bg-black'>
            <div>
                <h1 className='text-primary text-xl font-bold'>MUZUP</h1>
            </div>
            <div className='hidden md:flex'>
                <ul className='flex space-x-4 text-white'>
                    <li>About Us</li>
                    <li>How it works?</li>
                    <li>Pricing</li>
                </ul>
            </div>
            <div>
                <button className='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'>
                    Get Started
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
