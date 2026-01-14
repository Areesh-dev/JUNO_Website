// src/pages/RegistrationForm.jsx - FIXED LOGIC
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, AlertCircle, Phone, Briefcase, Building, User, Mail } from 'lucide-react'
import { submitRegistration } from '../services/api'
import '../pages/Pages.css'

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contact_no: z.string()
    .min(10, 'Contact number must be at least 10 digits')
    .max(15, 'Contact number is too long')
    .regex(/^[0-9+\-\s()]*$/, 'Only numbers and basic symbols allowed'),
  designation: z.string().min(1, 'Designation is required'),
  organisation: z.string().min(1, 'Organisation is required'),
})

const RegistrationForm = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      contact_no: '',
      designation: '',
      organisation: '',
    },
  })

  // ✅ CORRECT: Form submission handler
  const onSubmit = async (data) => {
    console.log('📤 Submitting form:', data)
    setIsSubmitting(true)
    setErrorMessage('')
    setIsSuccess(false)

    try {
      // Send to backend
      const result = await submitRegistration(data)
      console.log('✅ Registration success:', result)
      
      // Success
      setIsSuccess(true)
      reset()

      // Hide success after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)

    } catch (error) {
      console.error('❌ Registration error:', error)
      setErrorMessage(error.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8 mein-heading-purple">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-purple mb-4">
          Registration Form
        </h1>
        <p className="text-neutral-600 text-sm">
          Please fill out all the required information below.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-800">Registration Successful!</h3>
              <p className="text-green-700">
                Your information has been securely saved to our database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-[-1px_-1px_14px_-5px_#FEC732] p-6 md:p-8">
        {/* ✅ FIXED: Use handleSubmit from react-hook-form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
              <User className="inline h-4 w-4 mr-2" />
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple ${errors.name ? 'border-red-300' : 'border-neutral-300'
                }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              <Mail className="inline h-4 w-4 mr-2" />
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple ${errors.email ? 'border-red-300' : 'border-neutral-300'
                }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Contact No Field */}
          <div>
            <label htmlFor="contact_no" className="block text-sm font-medium text-neutral-700 mb-2">
              <Phone className="inline h-4 w-4 mr-2" />
              Contact Number *
            </label>
            <input
              id="contact_no"
              type="tel"
              {...register('contact_no')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple ${errors.contact_no ? 'border-red-300' : 'border-neutral-300'
                }`}
              placeholder="e.g., 0300-1234567"
            />
            {errors.contact_no && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.contact_no.message}
              </p>
            )}
          </div>

          {/* Designation/Role Field */}
          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-neutral-700 mb-2">
              <Briefcase className="inline h-4 w-4 mr-2" />
              Designation / Role *
            </label>
            <input
              id="designation"
              type="text"
              {...register('designation')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple ${errors.designation ? 'border-red-300' : 'border-neutral-300'
                }`}
              placeholder="e.g., Software Engineer"
            />
            {errors.designation && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.designation.message}
              </p>
            )}
          </div>

          {/* Organisation Field */}
          <div>
            <label htmlFor="organisation" className="block text-sm font-medium text-neutral-700 mb-2">
              <Building className="inline h-4 w-4 mr-2" />
              Organisation *
            </label>
            <input
              id="organisation"
              type="text"
              {...register('organisation')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple ${errors.organisation ? 'border-red-300' : 'border-neutral-300'
                }`}
              placeholder="e.g., Tech Company"
            />
            {errors.organisation && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.organisation.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-purple text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {isSubmitting ? 'Processing...' : 'Submit Registration'}
          </button>
        </form>
      </div>

      {/* Back Link */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate(-2)}
          className="text-primary-purple font-semibold hover:text-primary-dark"
        >
          ← Go Back
        </button>
      </div>
    </div>
  )
}

export default RegistrationForm