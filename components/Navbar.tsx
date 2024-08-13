import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const [toggle, setToggle] = useState(false);

    const toggleMenu = () => {
        setToggle(!toggle);
    };

    return (
        <nav className='flex justify-between items-center py-6 px-8 md:px-24 bg-[#121212]'>
            <div>
                <h1 className='text-[#1DB954] text-2xl font-extrabold'>MUZUP</h1>
            </div>
            <div className='hidden md:flex'>
                <ul className='flex space-x-8 text-white font-medium'>
                    <li className="hover:text-[#1DB954] cursor-pointer transition duration-300">About Us</li>
                    <li className="hover:text-[#1DB954] cursor-pointer transition duration-300">How it works?</li>
                    <li className="hover:text-[#1DB954] cursor-pointer transition duration-300">Pricing</li>
                </ul>
            </div>
            <div className='hidden md:block'>
                <button className='bg-[#1DB954] text-white px-6 py-2 rounded-lg hover:bg-[#1aa34a] transition duration-300'>
                    Get Started
                </button>
            </div>
            {/* Mobile Menu Toggle */}
            <div className='md:hidden'>
                <button onClick={toggleMenu}>
                    {toggle ? <XMarkIcon className='h-8 w-8 text-white' /> : <Bars3Icon className='h-8 w-8 text-white' />}
                </button>
            </div>
            {/* Mobile Menu */}
            <div 
                className={`absolute top-16 left-0 right-0 bg-[#121212] p-8 flex flex-col space-y-6 text-center z-10 transform transition-all duration-300 ease-in-out ${
                    toggle ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
                }`}
            >
                <ul className='text-white text-lg font-medium'>
                    <li className="hover:text-[#1DB954] cursor-pointer transition duration-300">About Us</li>
                    <li className="hover:text-[#1DB954] cursor-pointer transition duration-300">How it works?</li>
                    <li className="hover:text-[#1DB954] cursor-pointer transition duration-300">Pricing</li>
                </ul>
                <button className='bg-[#1DB954] text-white px-6 py-2 rounded-lg hover:bg-[#1aa34a] transition duration-300'>
                    Get Started
                </button>
            </div>
        </nav>
    );
};

export default Navbar;