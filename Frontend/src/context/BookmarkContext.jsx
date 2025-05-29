import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookmarks on mount
  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setBookmarks([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.API_URL}/api/bookmarks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBookmarks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (project) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
 
      await axios.post(
        `${config.API_URL}/api/bookmarks`,
        { projectId: project._id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh bookmarks after adding
      await fetchBookmarks();
    } catch (err) {
      console.error('Error adding bookmark:', err);
      throw err;
    }
  };

  const removeBookmark = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios.delete(`${config.API_URL}/api/bookmarks/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh bookmarks after removing
      await fetchBookmarks();
    } catch (err) {
      console.error('Error removing bookmark:', err);
      throw err;
    }
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, loading, error, addBookmark, removeBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => useContext(BookmarkContext); 