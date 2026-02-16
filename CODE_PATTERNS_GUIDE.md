# CODE PATTERNS GUIDE - Drive-Me Transport System

## How to Integrate Any Frontend Page with Real Backend APIs

This guide shows the exact patterns used throughout the project for consistent real API integration.

---

## Pattern 1: Page with Redux State Management

### File Structure
```
src/Pages/
  SamplePage/
    SamplePage.jsx          (Main page component)
    
src/Redux/slices/
    sampleSlice.js          (Redux reducer with async thunks)
    
src/services/
    sampleAPI.js            (API service layer)
```

### Example: Corporate Employee Bookings Page

#### 1. Create Redux Slice (`sampleSlice.js`)

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/api"

// Async thunks for API calls
export const fetchEmployeeBookings = createAsyncThunk(
  "sample/fetchEmployeeBookings",
  async ({ employeeId, status }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/corporate-employees/${employeeId}/bookings`, {
        params: { status }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings")
    }
  }
)

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  success: false,
}

const sampleSlice = createSlice({
  name: "sample",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeBookings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployeeBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload || []
        state.success = true
      })
      .addCase(fetchEmployeeBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
  },
})

export default sampleSlice.reducer
```

#### 2. Create API Service (`sampleAPI.js`)

```javascript
import api from "../../utils/api"

export const sampleAPIService = {
  // Get all bookings
  getBookings: async (employeeId, filters = {}) => {
    const response = await api.get(
      `/api/corporate-employees/${employeeId}/bookings`,
      { params: filters }
    )
    return response.data
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post(`/api/bookings`, bookingData)
    return response.data
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    const response = await api.put(`/api/bookings/${bookingId}`, updateData)
    return response.data
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    const response = await api.post(`/api/bookings/${bookingId}/cancel`, { reason })
    return response.data
  },
}

export default sampleAPIService
```

#### 3. Use in Page Component

```javascript
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchEmployeeBookings } from "../../Redux/slices/sampleSlice"

function SamplePage() {
  const dispatch = useDispatch()
  const { bookings, loading, error } = useSelector((state) => state.sample)
  const userId = useSelector((state) => state.auth.userId)

  useEffect(() => {
    if (userId) {
      dispatch(fetchEmployeeBookings({ employeeId: userId }))
    }
  }, [dispatch, userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Bookings</h1>
      {bookings.map((booking) => (
        <div key={booking._id}>{booking.tripId}</div>
      ))}
    </div>
  )
}

export default SamplePage
```

---

## Pattern 2: Component with Direct API Calls (No Redux)

Use this for simpler components that don't need state sharing.

```javascript
import { useState, useEffect } from "react"
import api from "../../utils/api"

function SimpleComponent() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/some-endpoint")
        setData(response.data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {data.map((item) => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  )
}

export default SimpleComponent
```

---

## Pattern 3: Real-Time Updates with Socket.io

```javascript
import { useEffect, useState } from "react"
import { useSocket } from "../../hooks/useSocket"

function RealtimeComponent() {
  const socket = useSocket()
  const [realTimeData, setRealTimeData] = useState(null)

  useEffect(() => {
    if (socket?.socket) {
      // Join a room
      socket.socket.emit("join-room", { roomId: "trip-123" })

      // Listen for updates
      socket.socket.on("trip-update", (data) => {
        console.log("Real-time update:", data)
        setRealTimeData(data)
      })

      // Handle location updates
      socket.socket.on("location-update", (locationData) => {
        console.log("Driver location:", locationData)
      })

      // Cleanup
      return () => {
        socket.socket.off("trip-update")
        socket.socket.off("location-update")
      }
    }
  }, [socket?.socket])

  return <div>{realTimeData ? JSON.stringify(realTimeData) : "Waiting..."}</div>
}

export default RealtimeComponent
```

---

## Pattern 4: Form Submission with API

```javascript
import { useState } from "react"
import api from "../../utils/api"

function FormComponent() {
  const [formData, setFormData] = useState({ name: "", email: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/api/submit-form", formData)

      if (response.data.success) {
        setSuccess(true)
        setFormData({ name: "", email: "" })
        // Optional: Show success message
      } else {
        setError(response.data.message || "Failed to submit")
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <button disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Submitted successfully!</div>}
    </form>
  )
}

export default FormComponent
```

---

## Pattern 5: Pagination & Filtering

```javascript
import { useState, useEffect } from "react"
import api from "../../utils/api"

function ListWithPagination() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ status: "all" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/items", {
          params: {
            page,
            limit,
            ...filters,
          },
        })

        setItems(response.data.data.items)
        setTotal(response.data.data.total)
      } catch (err) {
        console.error("Error fetching items:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [page, limit, filters])

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <select
        value={filters.status}
        onChange={(e) => {
          setFilters({ ...filters, status: e.target.value })
          setPage(1)
        }}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div>
            {items.map((item) => (
              <div key={item._id}>{item.name}</div>
            ))}
          </div>

          <div>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ListWithPagination
```

---

## Pattern 6: Error Handling Best Practices

```javascript
// Always follow this error handling pattern
async function apiCall() {
  try {
    const response = await api.get("/endpoint")
    
    // Check if API returned success:false
    if (!response.data.success) {
      throw new Error(response.data.message || "Operation failed")
    }

    return response.data.data
  } catch (error) {
    // Handle different error types
    if (error.response?.status === 401) {
      // Redirect to login
      console.error("Unauthorized - redirecting to login")
    } else if (error.response?.status === 403) {
      // No permission
      console.error("Access denied")
    } else if (error.response?.data?.message) {
      // Use backend error message
      console.error("API Error:", error.response.data.message)
    } else {
      // Generic error
      console.error("Error:", error.message)
    }
    
    throw error // Re-throw to caller
  }
}
```

---

## Pattern 7: Redux Store Integration

### Add slice to store

```javascript
// store.js
import { configureStore } from "@reduxjs/toolkit"
import sampleReducer from "./slices/sampleSlice"

export const store = configureStore({
  reducer: {
    sample: sampleReducer,
    // ... other reducers
  },
})
```

### Use in component

```javascript
const { bookings, loading } = useSelector((state) => state.sample)
const dispatch = useDispatch()

useEffect(() => {
  dispatch(fetchBookings())
}, [dispatch])
```

---

## Common API Response Patterns

### Success Response
```javascript
{
  success: true,
  message: "Operation completed successfully",
  data: {
    // actual data here
  }
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description",
  error: "ERROR_CODE"
}
```

### List Response with Pagination
```javascript
{
  success: true,
  data: {
    items: [...],
    total: 100,
    page: 1,
    limit: 10,
    pages: 10
  }
}
```

---

## Testing Your Integration

1. **Browser DevTools Console**
   ```javascript
   // Check Redux state
   console.log(store.getState())
   
   // Dispatch action manually
   store.dispatch(fetchBookings())
   ```

2. **Network Tab**
   - Check API calls are being made
   - Verify response data is correct
   - Check error responses

3. **Redux DevTools**
   - Install Redux DevTools browser extension
   - See all actions and state changes
   - Time-travel debugging

4. **Console Logs**
   - Use `console.log("[v0] message")` pattern
   - Check for API errors
   - Verify data flow

---

## Summary

Follow these patterns consistently across the project:

✅ **Redux for shared state** - Use async thunks for API calls
✅ **API Services** - Centralize API logic
✅ **Error Handling** - Always catch and handle errors
✅ **Loading States** - Show loading spinners
✅ **Real-Time** - Use Socket.io for live updates
✅ **Filtering** - Support pagination and filters
✅ **Type Safety** - Validate API responses

These patterns ensure consistent, maintainable, and scalable code across the entire system.
