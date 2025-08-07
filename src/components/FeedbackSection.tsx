import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

interface FeedbackItem {
  id: string;
  description: string;
  created_at: string;
}

const FeedbackSection: React.FC = () => {
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

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting feedback:', error);
        alert('Failed to delete feedback. Please try again.');
      } else {
        console.log('✅ Feedback deleted successfully');
        fetchUserFeedback(); // Refresh the list
        alert('Feedback deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback. Please try again.');
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
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Your Feedback ({userFeedback.length})
              </h3>
              <p className="text-xs text-blue-700">
                Share your thoughts and manage your feedback
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Feedback'}
          </button>
        </div>

        {/* User's Feedback History */}
        {userFeedback.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium text-blue-800">Your Feedback History:</h4>
            {userFeedback.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-3 border border-blue-200">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm resize-none"
                      rows={2}
                      maxLength={500}
                      aria-label="Edit feedback text"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">
                        {editText.length}/500 characters
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditFeedback(item.id)}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-800">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(item)}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Feedback Form */}
        {showForm && (
          <form onSubmit={handleSubmitFeedback} className="mt-4">
            <div className="space-y-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you think about VoiceFit, suggestions for improvements, or any issues you've encountered..."
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600">
                  {feedback.length}/500 characters
                </span>
                <button
                  type="submit"
                  disabled={!feedback.trim() || isSubmitting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;
