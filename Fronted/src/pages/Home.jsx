
// src/pages/Home.jsx - FULLY CORRECTED VERSION
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EventCard from '../components/EventCard'
import NextEventCountdown from '../components/NextEventCountdown'
import '../pages/Pages.css'
import CommunityImage from '../assets/community-spotlight.jpg'
import HeroImage from '../assets/hero-bg.png'

import {
  Search,
  Calendar as CalendarIcon,
  Users,
  ArrowRight
} from 'lucide-react'
import { getEvents } from '../services/api'

const UpcomingEventImage = 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204021/1_4_caup7g.jpg';
const Home = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })

  const navigate = useNavigate()

  const upcomingEvent = events.find(event => event.is_past === false) || events[0];
  const pastEvents = events.filter(event => event.is_past === true).slice(0, 4);
  const displayPastEvents = pastEvents.length > 0 ? pastEvents : events.slice(0, 4);
  const featuredEvent = events[0] || null
  const latestEvent = events[1] || null

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image Layer */}
        <div
          className="absolute inset-0"
        >
          <img src={HeroImage} className='absolute inset-0 md:w-50 md:m-auto h-full object-contain md:object-cover' />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center">

            {/* Tagline */}
            <p className="text-base sm:text-sm md:text-xl lg:text-3xl font-bold font-poppins text-black  sm:mb-6 md:mb-1">
              Your City. Real Events. Real People.
            </p>

            {/* Main Heading */}
            <h1 className="font-['Rowdies'] text-black leading-tight mb-6 sm:mb-8 md:mb-10
        text-5xl  /* Mobile: 36px */
        sm:text-7xl /* Small: 48px */
        md:text-6xl /* Medium: 60px */
        lg:text-7xl /* Large: 72px */
        xl:text-8xl /* XL: 96px */
        2xl:text-9xl /* 2XL: 128px */
      ">
              Discover What's <br className="hidden sm:block" />
              Happening in <br className="hidden sm:block" />
              Your City
            </h1>
          </div>
        </div>
      </section>

      {/* Community Spotlight */}
      <section className="
  mein-heading
  py-12 sm:py-16 lg:py-20
  bg-primary-purple
  px-4 sm:px-6 md:px-10 lg:px-14
  rounded-2xl
  my-10
">
        <h2 className="
    text-2xl sm:text-3xl md:text-4xl
    font-bold
    text-center
    mb-8 sm:mb-10 md:mb-12
    text-white
  ">
          Community Spotlight
        </h2>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-14 lg:gap-20">

          {/* Text */}
          <div className="flex-1 md:text-left text-center">
            <p className="
  text-[#f8f8f8]
  text-sm sm:text-base md:text-[15px] lg:text-lg
  leading-relaxed
  max-w-sm sm:max-w-md md:max-w-[380px] lg:max-w-xl
  mx-auto md:mx-0
">
              What If Making Friends Was Easy explores the idea behind JUNO — a platform built to make real connections simple again. In a time where social apps feel crowded yet isolating, JUNO focuses on bringing people together through real-world events, shared interests, and meaningful experiences. Instead of endless scrolling or awkward introductions, JUNO helps you discover what’s happening in your city, join events that match your vibe, and meet people naturally — the way friendships are meant to form. This post highlights how small moments at the right events can turn strangers into friends, and how JUNO is changing the way communities connect.
            </p>
          </div>

          {/* Image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <img
              src={CommunityImage}
              alt="Community Event"
              className="
          w-[70%]
          max-w-[260px] sm:max-w-sm md:max-w-md lg:max-w-lg
          shadow-[6px_6px_0px_2px_#FEC732]
          sm:shadow-[10px_10px_0px_3px_#FEC732]
          md:shadow-[16px_16px_0px_4px_#FEC732]
          lg:shadow-[22px_22px_0px_4px_#FEC732]
        "
            />
          </div>

        </div>
      </section>



      {/* Latest Event */}
      <section className="
  mein-heading-purple
  py-12 sm:py-16 lg:py-20
  px-4 sm:px-6 md:px-10 lg:px-14
  rounded-2xl
  my-10
">
        <h2 className="
    text-2xl sm:text-3xl md:text-4xl
    font-bold
    text-center
    mb-8 sm:mb-10 md:mb-12
    text-[#520893]
  ">
          Upcoming Event
        </h2>

        <div className="
    max-w-6xl mx-auto
    flex flex-col md:flex-row
    items-center md:items-start
    gap-10 md:gap-14 lg:gap-20
  ">


          {/* Image */}
          <div className="flex-1 flex justify-center md:justify-start">
            <img
              src={UpcomingEventImage}
              alt="Community Event"
              className="
          w-[70%]
          max-w-[260px] sm:max-w-sm md:max-w-md lg:max-w-lg
          shadow-[6px_6px_0px_2px_#520893]
          sm:shadow-[10px_10px_0px_3px_#520893]
          md:shadow-[16px_16px_0px_4px_#520893]
          lg:shadow-[22px_22px_0px_4px_#520893]
        "
            />
          </div>

          {/* Text */}
          <div className="flex-1 md:text-left text-center">
            <p className="
  text-[#520893]
  text-sm sm:text-base md:text-[15px] lg:text-lg
  leading-relaxed
  max-w-sm sm:max-w-md md:max-w-[380px] lg:max-w-xl
  mx-auto md:mx-0
">
              What If Making Friends Was Easy explores the idea behind JUNO — a platform built to make real connections simple again. In a time where social apps feel crowded yet isolating, JUNO focuses on bringing people together through real-world events, shared interests, and meaningful experiences. Instead of endless scrolling or awkward introductions, JUNO helps you discover what’s happening in your city, join events that match your vibe, and meet people naturally — the way friendships are meant to form. This post highlights how small moments at the right events can turn strangers into friends, and how JUNO is changing the way communities connect.
            </p>
            <button onClick={() => navigate('/registration')} className='py-2 px-3 bg-[#FEC732] mt-5 rounded-sm font-semibold text-[#520893] '>
              Register Now
            </button>
          </div>

        </div>
      </section>

      {/* Past Events - Masonry Layout */}
      <section className="container mx-auto py-12">
        <div className="text-center mb-12 mein-heading-purple">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-purple mb-4">Past Events</h2>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : pastEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No past events found. Check back later!</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-purple text-white rounded-lg"
            >
              Refresh Events
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  // Ensure unique images for each card
                  image_url: event.image_url || `https://picsum.photos/seed/event-${event.id}-${index}/600/800`
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/events" className="btn-accent inline-flex items-center">
            View All Events <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>



      {/* Countdown Section */}
      <section className="mein-heading py-12 bg-[#520893] rounded-2xl my-12 mx-4">
        <>

          <NextEventCountdown />

        </>
      </section>

      {/* How JUNO Works */}
      <section className="py-16 px-4 mein-heading-purple">
        <h2 className="text-3xl font-bold text-center mb-14 text-neutral-900">
          How JUNO Works
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
          {[
            {
              icon: Search,
              title: "Discover Events",
              description:
                "Explore curated events happening in your city — designed to bring people together.",
            },
            {
              icon: CalendarIcon,
              title: "Join the Event",
              description:
                "Show up, participate, and experience the event as it happens — no pressure, just real moments.",
            },
            {
              icon: Users,
              title: "Make Real Connections",
              description:
                "Meet people naturally through shared experiences and conversations that continue beyond the event.",
            },
          ].map((step, index) => (
            <div
              key={index}
              className="bg-primary-purple rounded-2xl p-8 text-center w-full max-w-sm shadow-lg"
            >
              <div className="flex justify-center mb-6 bg-[#fec832] w-16 h-16 rounded-full items-center mx-auto">
                <step.icon className="h-10 w-10 text-[#ffffff]" />
              </div>

              <h3 className="text-2xl font-semibold text-[#FEC732] mb-3 font-['Poppins']">
                {step.title}
              </h3>

              <p className="text-white/90 leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>



    </div>
  )
}

export default Home
