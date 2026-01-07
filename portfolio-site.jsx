import React, { useState, useEffect } from 'react';
import { Home, Briefcase, Code, Music, Edit3, Plus, Trash2, Save, X, LogOut, Lock } from 'lucide-react';

const PortfolioSite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentProject, setCurrentProject] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [password, setPassword] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load portfolio data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('portfolio-data');
        if (result && result.value) {
          setPortfolioData(JSON.parse(result.value));
        } else {
          // Initialize with default data
          const defaultData = {
            architecture: [],
            development: [],
            adu: []
          };
          setPortfolioData(defaultData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setPortfolioData({ architecture: [], development: [], adu: [] });
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const saveData = async (data) => {
    try {
      await window.storage.set('portfolio-data', JSON.stringify(data));
      setPortfolioData(data);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleAuth = () => {
    // Simple password check - in production, use proper authentication
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setShowAuth(false);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsEditMode(false);
  };

  const addItem = (category) => {
    setEditingItem({
      id: Date.now(),
      category,
      title: '',
      description: '',
      mainImage: '',
      supportingImages: [],
      fullText: '',
      tags: [],
      isNew: true
    });
  };

  const saveItem = async () => {
    if (!editingItem) return;
    
    const newData = { ...portfolioData };
    const category = editingItem.category;
    
    if (editingItem.isNew) {
      newData[category] = [...newData[category], { ...editingItem, isNew: false }];
    } else {
      newData[category] = newData[category].map(item => 
        item.id === editingItem.id ? { ...editingItem, isNew: false } : item
      );
    }
    
    await saveData(newData);
    setEditingItem(null);
  };

  const deleteItem = async (category, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const newData = { ...portfolioData };
    newData[category] = newData[category].filter(item => item.id !== id);
    await saveData(newData);
  };

  const editItem = (item, category) => {
    setEditingItem({ ...item, category });
  };

  const viewProject = (project, category) => {
    setCurrentProject({ ...project, category });
    setCurrentPage('project-detail');
  };

  const goBack = () => {
    if (currentProject) {
      setCurrentPage(currentProject.category);
      setCurrentProject(null);
    } else {
      setCurrentPage('home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl font-light">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gloock&family=Figtree:wght@300;400;500;600&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          overflow-x: hidden;
        }
        
        .hero-title {
          font-family: 'Gloock', serif;
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 0.9;
        }
        
        .body-text {
          font-family: 'Figtree', sans-serif;
        }
        
        .nav-link {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: white;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-link:hover::after {
          width: 100%;
        }
        
        .project-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .project-card:hover {
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-4px);
        }
        
        .circular-project {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .circular-project:hover {
          transform: scale(1.05);
        }
        
        .circular-project::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%);
          z-index: 1;
          transition: opacity 0.3s ease;
        }
        
        .circular-project:hover::before {
          opacity: 0.6;
        }
        
        .hero-section {
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }
        
        .hero-section:hover {
          transform: scale(1.2);
          z-index: 10;
        }
        
        .carousel-container {
          position: relative;
          overflow: hidden;
        }
        
        .carousel-track {
          display: flex;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.6;
        }
        
        .carousel-arrow:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.7);
        }
        
        .carousel-arrow.left {
          left: 20px;
        }
        
        .carousel-arrow.right {
          right: 20px;
        }
        
        @media (min-width: 768px) {
          .hero-section:hover {
            transform: scale(1.2);
          }
        }
        
        @media (max-width: 767px) {
          .hero-section {
            transform: none !important;
          }
          
          .hero-section:hover {
            transform: none !important;
          }
        }
        
        .hero-card-title {
          font-size: clamp(2rem, 5vw, 3rem);
        }
        
        .hero-card-description {
          font-size: clamp(0.875rem, 2vw, 1rem);
        }
        
        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
          z-index: 1;
          transition: opacity 0.3s ease;
        }
        
        .hero-section:hover::before {
          opacity: 0.8;
        }
        
        .glass-effect {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        
        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transform: translateY(40px);
        }
        
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-backdrop {
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-content {
          animation: modalSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes modalSlide {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-12">
              <button 
                onClick={() => {
                  setCurrentPage('home');
                  setCurrentProject(null);
                }}
                className="hero-title text-2xl tracking-tight"
              >
                Christopher Koss <span className="opacity-50">Portfolio</span>
              </button>
              <div className="hidden md:flex items-center space-x-8 body-text text-sm">
                {currentPage === 'project-detail' ? (
                  <button 
                    onClick={goBack}
                    className="nav-link opacity-70 hover:opacity-100 flex items-center space-x-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span>Back</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setCurrentPage('home')}
                      className="nav-link opacity-70 hover:opacity-100"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => setCurrentPage('architecture')}
                      className="nav-link opacity-70 hover:opacity-100"
                    >
                      Architecture
                    </button>
                    <button 
                      onClick={() => setCurrentPage('development')}
                      className="nav-link opacity-70 hover:opacity-100"
                    >
                      Development
                    </button>
                    <button 
                      onClick={() => setCurrentPage('adu')}
                      className="nav-link opacity-70 hover:opacity-100"
                    >
                      A-du
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <button
                  onClick={() => setShowAuth(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Lock size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-4 py-2 rounded-full transition-all body-text text-sm ${
                      isEditMode ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {isEditMode ? 'Done' : 'Edit'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-zinc-900 p-8 rounded-lg max-w-md w-full mx-4 modal-content border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="hero-title text-3xl">Admin Access</h2>
              <button onClick={() => setShowAuth(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg mb-4 body-text focus:outline-none focus:border-white/40"
            />
            <button
              onClick={handleAuth}
              className="w-full py-3 bg-white text-black rounded-lg body-text font-medium hover:bg-white/90 transition-colors"
            >
              Login
            </button>
            <p className="text-xs text-white/50 mt-4 body-text text-center">
              Demo password: admin123
            </p>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center modal-backdrop overflow-y-auto">
          <div className="bg-zinc-900 p-8 rounded-lg max-w-2xl w-full mx-4 my-8 modal-content border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="hero-title text-3xl">
                {editingItem.isNew ? 'Add New Project' : 'Edit Project'}
              </h2>
              <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 body-text">
              <div>
                <label className="block text-sm text-white/70 mb-2">Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
                  placeholder="Project title"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-2">Short Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40 h-20 resize-none"
                  placeholder="Brief description for thumbnail view"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-2">Main Image URL</label>
                <input
                  type="url"
                  value={editingItem.mainImage || editingItem.imageUrl || ''}
                  onChange={(e) => setEditingItem({...editingItem, mainImage: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-2">Supporting Images (one URL per line)</label>
                <textarea
                  value={Array.isArray(editingItem.supportingImages) ? editingItem.supportingImages.join('\n') : ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem, 
                    supportingImages: e.target.value.split('\n').map(url => url.trim()).filter(url => url)
                  })}
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40 h-32 resize-none"
                  placeholder="https://images.unsplash.com/photo1&#10;https://images.unsplash.com/photo2&#10;https://images.unsplash.com/photo3"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-2">Full Project Description</label>
                <textarea
                  value={editingItem.fullText || ''}
                  onChange={(e) => setEditingItem({...editingItem, fullText: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40 h-48 resize-none"
                  placeholder="Detailed description of the project, process, and outcomes..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
                  placeholder="React, Design, Modern"
                />
              </div>
              
              <button
                onClick={saveItem}
                className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>Save Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-20">
        {currentPage === 'home' && <HomePage 
          setCurrentPage={setCurrentPage}
          portfolioData={portfolioData}
        />}
        {currentPage === 'architecture' && <CategoryPage 
          category="architecture"
          title="Architecture"
          icon={Briefcase}
          items={portfolioData.architecture}
          isEditMode={isEditMode}
          onAddItem={() => addItem('architecture')}
          onEditItem={(item) => editItem(item, 'architecture')}
          onDeleteItem={(id) => deleteItem('architecture', id)}
          onViewProject={(item) => viewProject(item, 'architecture')}
        />}
        {currentPage === 'development' && <CategoryPage 
          category="development"
          title="Development"
          icon={Code}
          items={portfolioData.development}
          isEditMode={isEditMode}
          onAddItem={() => addItem('development')}
          onEditItem={(item) => editItem(item, 'development')}
          onDeleteItem={(id) => deleteItem('development', id)}
          onViewProject={(item) => viewProject(item, 'development')}
        />}
        {currentPage === 'adu' && <CategoryPage 
          category="adu"
          title="A-du"
          icon={Music}
          items={portfolioData.adu}
          isEditMode={isEditMode}
          onAddItem={() => addItem('adu')}
          onEditItem={(item) => editItem(item, 'adu')}
          onDeleteItem={(id) => deleteItem('adu', id)}
          onViewProject={(item) => viewProject(item, 'adu')}
        />}
        {currentPage === 'project-detail' && currentProject && <ProjectDetailPage 
          project={currentProject}
          isEditMode={isEditMode}
          onEdit={() => editItem(currentProject, currentProject.category)}
          onDelete={() => {
            deleteItem(currentProject.category, currentProject.id);
            goBack();
          }}
          onBack={goBack}
        />}
      </div>
    </div>
  );
};

const HomePage = ({ setCurrentPage, portfolioData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageIndices, setImageIndices] = useState({
    architecture: 0,
    development: 0,
    adu: 0
  });
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const categories = [
    {
      id: 'architecture',
      title: 'Architecture',
      description: 'Spatial design & structural innovation',
      image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80',
      count: portfolioData?.architecture?.length || 0
    },
    {
      id: 'development',
      title: 'Development',
      description: 'Digital products & code solutions',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
      count: portfolioData?.development?.length || 0
    },
    {
      id: 'adu',
      title: 'A-du',
      description: 'Creative audio experiences',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
      count: portfolioData?.adu?.length || 0
    }
  ];

  // Get images for a category
  const getCategoryImages = (categoryId) => {
    const items = portfolioData?.[categoryId] || [];
    if (items.length === 0) {
      // Return default image if no projects
      const category = categories.find(c => c.id === categoryId);
      return [category?.image];
    }
    return items.map(item => item.mainImage || item.imageUrl).filter(Boolean);
  };

  // Auto-rotate category hero images every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices(prev => ({
        architecture: (prev.architecture + 1) % Math.max(getCategoryImages('architecture').length, 1),
        development: (prev.development + 1) % Math.max(getCategoryImages('development').length, 1),
        adu: (prev.adu + 1) % Math.max(getCategoryImages('adu').length, 1)
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [portfolioData]);

  // Auto-rotate carousel every 10 seconds on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth < 768) {
        setCurrentSlide((prev) => (prev + 1) % categories.length);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [categories.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  const CategoryCard = ({ category, index }) => {
    const images = getCategoryImages(category.id);
    const currentImageIndex = imageIndices[category.id];
    const currentImage = images[currentImageIndex] || category.image;

    return (
      <button
        onClick={() => setCurrentPage(category.id)}
        className="hero-section relative h-96 rounded-lg overflow-hidden group cursor-pointer slide-up"
        style={{animationDelay: `${0.4 + index * 0.1}s`}}
      >
        <div className="absolute inset-0 w-full h-full">
          {images.map((img, imgIndex) => (
            <img
              key={imgIndex}
              src={img}
              alt={category.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              style={{
                opacity: imgIndex === currentImageIndex ? 1 : 0,
                transform: imgIndex === currentImageIndex 
                  ? 'translateX(0)' 
                  : imgIndex < currentImageIndex 
                    ? 'translateX(-100%)' 
                    : 'translateX(100%)',
                transition: 'opacity 0.7s ease-in-out, transform 0.7s ease-in-out'
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
          <div className="glass-effect rounded-2xl p-6 transition-all duration-300 text-center w-full">
            <h2 className="hero-title hero-card-title mb-3">{category.title}</h2>
            <p className="body-text text-white/80 hero-card-description">{category.description}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-32 fade-in">
        <h1 className="hero-title text-8xl md:text-9xl mb-6" style={{animationDelay: '0.1s'}}>
          Selected
          <br />
          Works
        </h1>
        <p className="body-text text-xl text-white/60 max-w-xl slide-up" style={{animationDelay: '0.3s'}}>
          A curated collection of architecture, development, and creative projects
        </p>
      </div>

      {/* Category Grid - Desktop */}
      <div className="max-w-7xl mx-auto px-6 pb-32 hidden md:block">
        <div className="grid grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>

      {/* Category Carousel - Mobile */}
      <div 
        className="max-w-7xl mx-auto px-6 pb-32 md:hidden carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-96">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {categories.map((category, index) => {
              const images = getCategoryImages(category.id);
              const currentImageIndex = imageIndices[category.id];

              return (
                <div
                  key={category.id}
                  className="min-w-full px-2"
                >
                  <button
                    onClick={() => setCurrentPage(category.id)}
                    className="hero-section relative h-96 rounded-lg overflow-hidden w-full"
                  >
                    <div className="absolute inset-0 w-full h-full">
                      {images.map((img, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={img}
                          alt={category.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            opacity: imgIndex === currentImageIndex ? 1 : 0,
                            transform: imgIndex === currentImageIndex 
                              ? 'translateX(0)' 
                              : imgIndex < currentImageIndex 
                                ? 'translateX(-100%)' 
                                : 'translateX(100%)',
                            transition: 'opacity 0.7s ease-in-out, transform 0.7s ease-in-out'
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
                      <div className="glass-effect rounded-2xl p-6 transition-all duration-300 text-center w-full">
                        <h2 className="hero-title hero-card-title mb-3">{category.title}</h2>
                        <p className="body-text text-white/80 hero-card-description">{category.description}</p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="carousel-arrow left"
            aria-label="Previous category"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="carousel-arrow right"
            aria-label="Next category"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-8' : 'bg-white/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="body-text text-sm text-white/50 text-center">
            © {new Date().getFullYear()} Christopher Koss. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const CategoryPage = ({ 
  category, 
  title, 
  icon: Icon, 
  items, 
  isEditMode,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onViewProject
}) => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-20 fade-in">
        <div className="flex items-center space-x-4 mb-6">
          <Icon size={40} className="text-white/60" />
          <h1 className="hero-title text-7xl md:text-8xl">{title}</h1>
        </div>
        {isEditMode && (
          <div className="flex justify-end">
            <button
              onClick={onAddItem}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-full body-text font-medium hover:bg-white/90 transition-colors"
            >
              <Plus size={20} />
              <span>Add Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="body-text text-white/40 text-lg">
              No projects yet. {isEditMode && "Click 'Add Project' to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <button
                  onClick={() => !isEditMode && onViewProject(item)}
                  className="circular-project w-full"
                  disabled={isEditMode}
                >
                  <img
                    src={item.mainImage || item.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80'}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
                    <h3 className="hero-title text-2xl md:text-3xl text-center text-white">
                      {item.title}
                    </h3>
                  </div>
                </button>
                
                {isEditMode && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => onEditItem(item)}
                      className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg body-text text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg body-text text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectDetailPage = ({ project, isEditMode, onEdit, onDelete, onBack }) => {
  const allImages = [
    project.mainImage || project.imageUrl,
    ...(project.supportingImages || [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-[60vh] overflow-hidden fade-in">
        <img
          src={project.mainImage || project.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black"></div>
        
        <button
          onClick={onBack}
          className="absolute top-8 left-8 p-3 bg-black/50 backdrop-blur-md border border-white/20 rounded-full hover:bg-black/70 transition-colors z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="glass-effect rounded-2xl p-8 md:p-12 mb-12 slide-up">
          <h1 className="hero-title text-5xl md:text-7xl mb-6">{project.title}</h1>
          
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-full body-text text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isEditMode && (
            <div className="flex space-x-3 mb-8 pb-8 border-b border-white/10">
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg body-text transition-colors"
              >
                <Edit3 size={18} />
                <span>Edit Project</span>
              </button>
              <button
                onClick={onDelete}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg body-text transition-colors"
              >
                <Trash2 size={18} />
                <span>Delete Project</span>
              </button>
            </div>
          )}

          {project.description && (
            <p className="body-text text-xl text-white/80 mb-8 leading-relaxed">
              {project.description}
            </p>
          )}

          {project.fullText && (
            <div className="body-text text-white/70 leading-relaxed whitespace-pre-wrap">
              {project.fullText}
            </div>
          )}
        </div>

        {/* Supporting Images */}
        {project.supportingImages && project.supportingImages.length > 0 && (
          <div className="space-y-8 slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="hero-title text-3xl mb-6">Project Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.supportingImages.map((img, index) => (
                <div
                  key={index}
                  className="aspect-video overflow-hidden rounded-lg border border-white/10"
                >
                  <img
                    src={img}
                    alt={`${project.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioSite;