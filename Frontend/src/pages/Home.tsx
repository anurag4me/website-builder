import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';

const Home: React.FC = () => {
  const [prompt, setPrompt] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Wand2 className="w-12 h-12 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Website Builder Assistant
          </h1>
          <p className="text-lg text-gray-300">
            Describe your dream website, and we'll help you build it step by step
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to build..."
              className="w-full h-32 p-4 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-gray-400"
            />
            <button
              type="submit"
              className="w-full mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!prompt.trim()}
            >
              Generate Website Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;