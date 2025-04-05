import React, { useState } from 'react'
import { Search, MessageSquare, Loader2 } from 'lucide-react'
import axiosInstance from '../utils/axios'
import { useChat } from '../hooks/useChat'

const UserSearchBar = () => {
  const { socket, createNewConversation } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Debounce function to prevent too many API calls
  const debounce = (func, wait) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([])
      return
    }

    setLoading(true)
    try {
      const { data } = await axiosInstance.get('/users')

      // Filter users locally based on search query
      const filteredUsers = data.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
      )

      setUsers(filteredUsers)
      setError('')
    } catch (err) {
      setError('Failed to fetch users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced version of searchUsers
  const debouncedSearch = React.useCallback(
    debounce((query) => searchUsers(query), 300),
    []
  )

  const createConversation = async (userId) => {
    try {
      const { data } = await axiosInstance.post('/conversations', {
        name: '',
        participantIds: [userId]
      })
      createNewConversation(data)
      socket.emit('joinRoom', data.id + "")
      socket.emit('inviteClient', {
        roomId: data.id,
        clientsId: data.Participants.map((p) => p['Users'].id)
      })
      // Clear search
      setSearchQuery('')
      setUsers([])

    } catch (err) {
      console.error('Create conversation error:', err)
      setError('Failed to create conversation')
    }
  }

  return (
    <div className='w-full max-w-md mx-auto p-4'>
      {/* Search Input */}
      <div className='relative'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value
            setSearchQuery(value)
            debouncedSearch(value)
          }}
          placeholder='Search users...'
          className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center p-4'>
          <Loader2 className='h-6 w-6 animate-spin text-blue-500' />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='text-red-500 text-sm mt-2 text-center'>{error}</div>
      )}

      {/* Users List */}
      {users.length > 0 && (
        <div className='mt-2 border rounded-lg shadow-sm overflow-hidden bg-white'>
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => createConversation(user.id)}
              className='flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0'
            >
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-blue-600 font-medium'>
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className='font-medium'>{user.username}</div>
                  {user.email && (
                    <div className='text-sm text-gray-500'>{user.email}</div>
                  )}
                </div>
              </div>
              <MessageSquare className='h-5 w-5 text-gray-400' />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserSearchBar
