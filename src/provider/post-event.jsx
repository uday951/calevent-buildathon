import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Upload, X, MapPin, Calendar, Users, DollarSign,
  Clock, Tag, Image as ImageIcon, FileText, Star,
  Plus, Minus, ArrowLeft, Package
} from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { eventsAPI, comboAPI } from '@/services/api'

const schema = yup.object({
  title: yup.string().required('Event title is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  price: yup.number().min(1, 'Price must be greater than 0').required('Price is required'),
  location: yup.string().required('Location is required'),
  maxCapacity: yup.number().min(1, 'Capacity must be at least 1').required('Max capacity is required'),
  duration: yup.string().required('Duration is required'),
  features: yup.array().of(
    yup.object({
      name: yup.string().required('Feature name is required')
    })
  ).min(1, 'At least one feature is required')
})

const PostEvent = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [eventType, setEventType] = useState('single') // 'single' or 'combo'
  const [comboServices, setComboServices] = useState([{ name: '', price: '', included: true }])

  const categories = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'conference', label: 'Conference' },
    { value: 'party', label: 'Party' }
  ]

  const addComboService = () => {
    setComboServices([...comboServices, { name: '', price: '', included: true }])
  }

  const removeComboService = (index) => {
    setComboServices(comboServices.filter((_, i) => i !== index))
  }

  const updateComboService = (index, field, value) => {
    const updated = [...comboServices]
    updated[index][field] = value
    setComboServices(updated)
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      features: [{ name: '' }],
      price: '',
      maxCapacity: '',
      duration: '4 hours'
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features'
  })

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            file,
            preview: e.target.result
          }])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    setIsSubmitting(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      
      // Add form fields with proper formatting
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('category', data.category)
      formData.append('price', data.price)
      formData.append('maxCapacity', data.maxCapacity)
      formData.append('duration', data.duration)
      
      // Format features array - extract just the names
      const featureNames = data.features.map(f => f.name).filter(name => name.trim())
      formData.append('features', JSON.stringify(featureNames))
      
      // Add event type and combo data
      formData.append('type', eventType)
      if (eventType === 'combo') {
        const validServices = comboServices.filter(s => s.name.trim())
        formData.append('comboServices', JSON.stringify(validServices))
        formData.append('originalPrice', data.originalPrice || data.price * 1.4)
      }
      
      // Format location as JSON string for controller to parse
      formData.append('location', JSON.stringify({
        address: data.location,
        city: data.location
      }))
      
      let response;
      
      if (eventType === 'combo') {
        // For combo events, add all images
        images.forEach(image => {
          formData.append('images', image.file)
        })
        
        // Add combo-specific fields
        formData.append('originalPrice', data.originalPrice || data.price * 1.4)
        formData.append('comboPrice', data.price)
        formData.append('maxGuests', data.maxCapacity)
        const processedServices = comboServices.filter(s => s.name.trim()).map(service => ({
          name: service.name,
          description: service.name, // Use name as description
          included: service.included,
          price: parseFloat(service.price) || 0
        }));
        formData.append('services', JSON.stringify(processedServices))
        
        response = await comboAPI.createCombo(formData)
      } else {
        // For regular events, add primary image only
        if (images.length > 0) {
          formData.append('eventImage', images[0].file)
        }
        
        response = await eventsAPI.createEvent(formData)
      }
      
      if (response.success) {
        toast.success(`${eventType === 'combo' ? 'Combo package' : 'Event'} posted successfully!`)
        navigate('/provider/dashboard')
      } else {
        toast.error(response.message || `Failed to post ${eventType === 'combo' ? 'combo package' : 'event'}`)
      }
    } catch (error) {
      console.error('Event creation error:', error)
      
      // Show detailed validation errors
      if (error.data && error.data.errors) {
        error.data.errors.forEach(err => toast.error(err))
      } else {
        toast.error(error.message || 'Failed to post event. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Post New Event</h1>
          <p className="text-gray-600 mt-2">Create a new event listing for customers to book</p>
          
          {/* Event Type Selection */}
          <div className="mt-6 flex space-x-4">
            <button
              type="button"
              onClick={() => setEventType('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                eventType === 'single'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Single Event
            </button>
            <button
              type="button"
              onClick={() => setEventType('combo')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                eventType === 'combo'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Combo Package
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <Input
                  placeholder="Enter event title"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your event in detail..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    {...register('category')}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    {...register('duration')}
                  >
                    <option value="2 hours">2 hours</option>
                    <option value="4 hours">4 hours</option>
                    <option value="6 hours">6 hours</option>
                    <option value="8 hours">8 hours</option>
                    <option value="Full day">Full day</option>
                    <option value="2 days">2 days</option>
                    <option value="3 days">3 days</option>
                  </select>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Pricing & Capacity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {eventType === 'combo' ? 'Combo Price (₹) *' : 'Starting Price (₹) *'}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="number"
                      placeholder={eventType === 'combo' ? 'Enter combo price' : 'Enter starting price'}
                      className="pl-10"
                      {...register('price', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {eventType === 'combo' ? 'Discounted package price' : 'Base price for minimum capacity'}
                  </p>
                </div>

                {eventType === 'combo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price (₹) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="number"
                        placeholder="Enter original price"
                        className="pl-10"
                        {...register('originalPrice', { valueAsNumber: true })}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Price before discount</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Capacity *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="number"
                      placeholder="Enter max capacity"
                      className="pl-10"
                      {...register('maxCapacity', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.maxCapacity && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxCapacity.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combo Services */}
          {eventType === 'combo' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Combo Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comboServices.map((service, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <Input
                          placeholder="Service name"
                          value={service.name}
                          onChange={(e) => updateComboService(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Individual price"
                          value={service.price}
                          onChange={(e) => updateComboService(index, 'price', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={service.included}
                            onChange={(e) => updateComboService(index, 'included', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Included</span>
                        </label>
                        {comboServices.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeComboService(index)}
                            className="text-red-600"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addComboService}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Enter city or area"
                    className="pl-10"
                    {...register('location')}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Event Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter feature (e.g., Professional Photography)"
                        {...register(`features.${index}.name`)}
                      />
                      {errors.features?.[index]?.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.features[index].name.message}
                        </p>
                      )}
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '' })}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Feature</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Event Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop images here or click to upload
                </p>
                <p className="text-gray-500 mb-4">
                  Upload high-quality images of your events (JPG, PNG)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button type="button" variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Uploaded Images</h4>
                  <p className="text-sm text-gray-500 mb-4">First image will be used as the main event image</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt="Event"
                          className={`w-full h-32 object-cover rounded-lg ${
                            index === 0 ? 'ring-2 ring-purple-500' : ''
                          }`}
                        />
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/provider/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Posting...' : 'Post Event'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostEvent