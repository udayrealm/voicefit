import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

interface FeedbackItem {
  id: string;
  description: string;
  created_at: string;
}

const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userFeedback, setUserFeedback] = useState<FeedbackItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Fetch user's feedback history
  const fetchUserFeedback = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('id, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
      } else {
        setUserFeedback(data || []);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  useEffect(() => {
    fetchUserFeedback();
  }, [user]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          username: user.username,
          description: feedback.trim()
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again.');
      } else {
        console.log('✅ Feedback submitted successfully');
        setFeedback('');
        setShowForm(false);
        fetchUserFeedback(); // Refresh the list
        alert('Thank you for your feedback!');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFeedback = async (id: string) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .update({ description: editText.trim() })
        .eq('id', id);

      if (error) {
        console.error('Error updating feedback:', error);
        alert('Failed to update feedback. Please try again.');
      } else {
        console.log('✅ Feedback updated successfully');
        setEditingId(null);
        setEditText('');
        fetchUserFeedback(); // Refresh the list
        alert('Feedback updated successfully!');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback. Please try again.');
    }
  };



  const startEditing = (feedback: FeedbackItem) => {
    setEditingId(feedback.id);
    setEditText(feedback.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access the feedback page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
                         <div>
               <h1 className="text-2xl font-bold text-gray-900">💡 Share Your Ideas</h1>
               <p className="text-gray-600">Help us make VoiceFit better with your feedback!</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
                         <div>
               <h2 className="text-lg font-semibold text-gray-900">💡 Your Ideas Matter</h2>
               <p className="text-gray-600">You've shared {userFeedback.length} great ideas with us!</p>
             </div>
                         <button
               onClick={() => setShowForm(!showForm)}
               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
             >
               {showForm ? 'Cancel' : 'Add New Feedback'}
             </button>
          </div>
        </div>

        {/* Add New Feedback Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Feedback</h3>
            <form onSubmit={handleSubmitFeedback}>
              <div className="space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think about VoiceFit, suggestions for improvements, or any issues you've encountered..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {feedback.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={!feedback.trim() || isSubmitting}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* User's Feedback History */}
        {userFeedback.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Feedback History</h3>
            {userFeedback.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                {editingId === item.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      maxLength={500}
                      aria-label="Edit feedback text"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {editText.length}/500 characters
                      </span>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditFeedback(item.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-800 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        Submitted on {new Date(item.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                                             <div className="flex space-x-3">
                         <button
                           onClick={() => startEditing(item)}
                           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                         >
                           Edit
                         </button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Be the First to Share!</h3>
             <p className="text-gray-600 mb-4">Your ideas help us make VoiceFit amazing for everyone!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
            >
              Add Your First Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
