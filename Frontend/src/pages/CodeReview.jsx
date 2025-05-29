import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import axiosInstance from '../utils/axios';
import "prismjs/themes/prism-tomorrow.css";
import "highlight.js/styles/github-dark.css";
import { useProjects } from '../context/ProjectContext';
import { useLocation } from 'react-router-dom';
import { FaHome, FaCode, FaFolder, FaBookmark, FaUser } from 'react-icons/fa';

const CodeReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;
  const { addProject } = useProjects();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [code, setCode] = useState(project?.code || `function sum(){ 
  return 1+1
}`);
  const [review, setReview] = useState(project?.review || '');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    prism.highlightAll();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const reviewCode = async () => {
    setLoading(true);
    setReview('');
    try {
      const response = await axiosInstance.post('/ai/get-review', { code });
      setReview(response.data);
    } catch (err) {
      setReview("Error fetching review. Please try again.");
    }
    setLoading(false);
  };

  const handleAddProject = () => {
    const name = prompt('Enter project name:', project?.name || '');
    if (!name) return;
    const language = prompt('Enter language (e.g. JavaScript, Python, etc):', project?.language || 'JavaScript');
    if (!language) return;
    const healthScore = project?.healthScore || Math.floor(Math.random() * 41) + 60;
    addProject({
      name,
      language,
      code,
      review,
      healthScore
    });
    alert('Project added to dashboard!');
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  return (
    <div className="code-review-container">
      <header className="code-review-header">
        <div className="header-left">
          <Link to="/dashboard" className="nav-link">
            <FaHome /> <span className="logo-text"><span className="logo-code">Code</span><span className="logo-pilot">Pilot</span></span>
          </Link>
          <Link to="/code-review" className="nav-link active"><FaCode /> My Code Reviews</Link>
          <Link to="/dashboard" className="nav-link"><FaFolder /> My Project</Link>
          <Link to="/bookmarks" className="nav-link"><FaBookmark /> Bookmarks</Link>
          <div className="dashboard-profile-group" ref={dropdownRef}>
            <button 
              className="profile-button-inline"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              type="button"
            >
              Hi, Arpit <span className="dropdown-arrow">👤▼</span>
            </button>
            {showProfileDropdown && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  Update Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="code-review-main">
        <div className="code-review-split">
          <div className="code-editor-container">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
              padding={10}
              className="code-editor"
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
              }}
            />
            <div className="code-review-actions">
              <button 
                onClick={reviewCode}
                className="code-review-button primary"
                disabled={loading} 
              >
                {loading ? "Reviewing..." : "Review Code"}
              </button>
              <button 
                onClick={handleAddProject}
                className="code-review-button secondary"
                disabled={loading}
              >
                Add to My Projects
              </button>
            </div>
          </div>
          <div className="code-review-result">
            {loading ? (
              <div className="loading">Analyzing your code...</div>
            ) : review ? (
              <Markdown rehypePlugins={[rehypeHighlight]}>
                {review}
              </Markdown>
            ) : (
              <div className="empty-review">
                <h3>Code Review</h3>
                <p>Write your code on the left and click "Review Code" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeReview; 