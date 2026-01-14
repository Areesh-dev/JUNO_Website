// src/components/Header.jsx
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Calendar } from 'lucide-react'
import logo from '../assets/JUNO-Logo.png'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navLinks = [
        { name: 'HOME', path: '/' },
        { name: 'EVENTS', path: '/events' },
    ]

    return (
        <header className="
  sticky top-0 z-50 bg-white shadow-sm
  px-4 sm:px-6 md:px-12 lg:px-16 
">
            <div className="container mx-auto px-4 py-4 ">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <img className='h-8 w-18' src={logo} alt="JUNO Logo" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `font-medium ${isActive ? 'text-primary-purple' : 'text-neutral-700 hover:text-primary-purple'}`
                                }
                            >
                                {link.name}
                            </NavLink>

                        ))}
                        <NavLink
                            to="/registration"
                            className={({ isActive }) =>
                                `px-5 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out
     ${isActive
                                    ? 'bg-primary-purple text-white'
                                    : 'bg-primary-purple text-white hover:bg-[#FEC732] hover:text-[#520893]'
                                }`
                            }
                        >
                            REGISTER FOR EVENT
                        </NavLink>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-neutral-700"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden  mt-4 pb-4">
                        <nav className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `font-medium ${isActive ? 'text-primary-purple' : 'text-neutral-700 hover:text-primary-purple'}`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            <NavLink
                                to="/registration"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-4 py-2 rounded-lg bg-primary-purple text-white font-semibold w-fit"
                            >
                                REGISTER FOR EVENT
                            </NavLink>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header