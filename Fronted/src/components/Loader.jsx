import loader from '../assets/juno_loader.gif'

const Loader = ({ fullScreen = false }) => {
  return (
    <div
      className={`
        flex items-center justify-center
        ${fullScreen ? 'fixed inset-0 z-[9999] bg-white' : 'py-20'}
      `}
    >
      <img
        src={loader}
        alt="Loading..."
        className="w-52 sm:w-80 md:w-96"
      />
    </div>
  )
}

export default Loader
