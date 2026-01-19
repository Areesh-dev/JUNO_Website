// src/components/Footer.jsx
import { Link } from 'react-router-dom'
import { Calendar, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import logo from '../assets/JUNO-Logo-Opposite-Color.png'

const Footer = () => {
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Register Now', path: '/registration' },
  ]

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/letsjuno_/' }
  ]

  return (
    <footer className="bg-[#520893] text-white mt-20 border-t-2 border-[#520893]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 " >
          {/* Brand Section */}
          <div className='w-full m-auto'>
           
            <p className="text-neutral-400">
              Discover amazing events in your city. Connect with people and build community.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-neutral-400 hover:text-accent-yellow transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="bg-[#FEC732] p-2 rounded-t-lg text-[#520893] transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; {new Date().getFullYear()} JUNO Events. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
