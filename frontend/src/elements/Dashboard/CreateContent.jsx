import { useState } from 'react';
import api from '../../config/api';

function CreateContent({ onClose, onSuccess }) {
  const [step, setStep] = useState('select'); // 'select', 'create'
  const [contentType, setContentType] = useState(''); // 'post', 'reel', 'story'
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [hashtags, setHashtags] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContentTypeSelect = (type) => {
    setContentType(type);
    setStep('create');
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate based on content type
    if (contentType === 'reel' && files.length > 1) {
      setError('Reels can only have one video');
      return;
    }
    
    if (contentType === 'story' && files.length > 1) {
      setError('Stories can only have one media item');
      return;
    }

    // Validate file types
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        setError('Only image and video files are allowed');
        return;
      }

      if (contentType === 'post' && !isImage) {
        setError('Posts can only have images');
        return;
      }

      if (contentType === 'reel' && !isVideo) {
        setError('Reels must be videos');
        return;
      }
    }

    setMediaFiles(files);
    setError('');

    // Create preview URLs
    const previews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name
    }));
    setMediaPreview(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (mediaFiles.length === 0) {
        setError('Please select at least one media file');
        setLoading(false);
        return;
      }

      // Convert files to base64 for storage (temporary solution)
      // In production, you'd upload files to a cloud storage service (AWS S3, Cloudinary, etc.)
      const mediaData = await Promise.all(
        mediaFiles.map(async (file, index) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                url: reader.result, // base64 data URL
                type: file.type.startsWith('image/') ? 'image' : 'video',
                duration: file.type.startsWith('video/') ? 30 : undefined
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Prepare request data
      const requestData = {
        contentType,
        media: mediaData,
        visibility
      };

      if (content.trim()) requestData.content = content.trim();
      
      // Extract hashtags
      if (hashtags.trim()) {
        requestData.hashtags = hashtags
          .split(' ')
          .filter(tag => tag.startsWith('#'))
          .map(tag => tag.substring(1));
      }

      const response = await api.post('/api/content/create', requestData);

      if (response.data.success) {
        // Clean up preview URLs
        mediaPreview.forEach(preview => URL.revokeObjectURL(preview.url));
        
        if (onSuccess) onSuccess(response.data.content);
        if (onClose) onClose();
      } else {
        setError(response.data.message || 'Failed to create content');
      }
    } catch (err) {
      console.error('Create content error:', err);
      setError(err.message || 'Failed to create content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center" 
        onClick={onClose}
      >
        <div 
          className="bg-[#1c1c1c] rounded-xl w-64 shadow-2xl border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-base font-medium text-white">Create</h2>
          </div>

          {error && (
            <div className="mx-4 mt-3 bg-red-500 bg-opacity-20 border border-red-500 text-white px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Menu Options */}
          <div className="py-2">
            <button
              onClick={() => handleContentTypeSelect('post')}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition-colors group"
            >
              <span className="text-white text-sm font-normal">Post</span>
              <div className="w-9 h-9 flex items-center justify-center rounded bg-[#2a2a2a] group-hover:bg-[#363636]">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => handleContentTypeSelect('reel')}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition-colors group"
            >
              <span className="text-white text-sm font-normal">Reel</span>
              <div className="w-9 h-9 flex items-center justify-center rounded bg-[#2a2a2a] group-hover:bg-[#363636]">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => handleContentTypeSelect('story')}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition-colors group"
            >
              <span className="text-white text-sm font-normal">Story</span>
              <div className="w-9 h-9 flex items-center justify-center rounded bg-[#2a2a2a] group-hover:bg-[#363636]">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </button>
          </div>

          {/* Close button at bottom */}
          <div className="px-4 py-3 border-t border-gray-700">
            <button 
              onClick={onClose}
              className="w-full text-center text-gray-400 hover:text-white text-sm py-1 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create form step
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#262626] rounded-lg max-w-2xl w-full my-8">
        <div className="flex justify-between items-center p-4 border-b border-[#363636]">
          <button onClick={() => setStep('select')} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-white capitalize">Create {contentType}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {contentType === 'reel' ? 'Video' : contentType === 'post' ? 'Photos' : 'Media'} *
            </label>
            <input
              type="file"
              accept={contentType === 'reel' ? 'video/*' : 'image/*'}
              multiple={contentType === 'post'}
              onChange={handleMediaChange}
              className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
            {mediaPreview.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {mediaPreview.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded overflow-hidden">
                    {preview.type === 'image' ? (
                      <img src={preview.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    ) : (
                      <video src={preview.url} className="w-full h-full object-cover" controls />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Caption - Only for posts and reels */}
          {contentType !== 'story' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Caption
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a caption..."
                rows="3"
                className="w-full px-3 py-2 bg-[#363636] border border-[#404040] rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Hashtags */}
          {contentType !== 'story' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#hashtag #another"
                className="w-full px-3 py-2 bg-[#363636] border border-[#404040] rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-3 py-2 bg-[#363636] border border-[#404040] rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="public">Public</option>
              <option value="followers">Followers only</option>
              <option value="close_friends">Close friends</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : `Share ${contentType}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateContent;
