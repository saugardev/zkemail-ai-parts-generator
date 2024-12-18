'use client';

import { useState } from 'react';
import BlueprintResponse from './blueprint-response';

export default function BlueprintGenerator() {
  // First call - Prompt Refiner
  const [promptText, setPromptText] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');

  // Second call - Parts Extractor
  const [instructions, setInstructions] = useState('');
  const [emlFile, setEmlFile] = useState<File | null>(null);
  const [extractedParts, setExtractedParts] = useState('');

  // Third call - Regex Generator
  const [parts, setParts] = useState('');
  const [regexPrompt, setRegexPrompt] = useState('');
  const [result, setResult] = useState('');

  const [loading, setLoading] = useState(false);

  const handlePromptRefiner = async () => {
    setLoading(true);
    try {
      const refinerRes = await fetch('/api/prompt-refiner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: promptText }),
      });
      const refinedPromptResult = await refinerRes.json();
      setRefinedPrompt(refinedPromptResult);
      setRegexPrompt(refinedPromptResult); // Pre-fill for next step
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartsExtractor = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('instructions', instructions || refinedPrompt); // Use previous result if available
      if (emlFile) formData.append('file', emlFile);

      const extractorRes = await fetch('/api/parts-extractor', {
        method: 'POST',
        body: formData,
      });
      const extractedPartsResult = await extractorRes.json();
      setExtractedParts(extractedPartsResult);
      setParts(extractedPartsResult); // Pre-fill for next step
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegexGenerator = async () => {
    setLoading(true);
    try {
      const regexRes = await fetch('/api/regex-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parts: parts || extractedParts, // Use previous result if available
          refinedPrompt: regexPrompt || refinedPrompt
        }),
      });
      const regexPatterns = await regexRes.json();
      setResult(JSON.stringify(regexPatterns, null, 2));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFullProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    await handlePromptRefiner();
    await handlePartsExtractor();
    await handleRegexGenerator();
  };

  return (
    <div className="flex gap-8">
      <div className="w-1/2">
        <form onSubmit={handleFullProcess} className="space-y-8">
          {/* First Call Section */}
          <section className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">1. Prompt Refiner</h2>
            <div>
              <label htmlFor="promptText" className="block text-sm font-medium text-gray-700">
                Text to Refine
              </label>
              <textarea
                id="promptText"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                required
              />
            </div>
            <button
              type="button"
              onClick={handlePromptRefiner}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refine Prompt
            </button>
          </section>

          {/* Second Call Section */}
          <section className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">2. Parts Extractor</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  value={instructions || refinedPrompt}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label htmlFor="emlFile" className="block text-sm font-medium text-gray-700">
                  EML File
                </label>
                <input
                  type="file"
                  id="emlFile"
                  accept=".eml"
                  onChange={(e) => setEmlFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handlePartsExtractor}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Extract Parts
            </button>
          </section>

          {/* Third Call Section */}
          <section className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">3. Regex Generator</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="parts" className="block text-sm font-medium text-gray-700">
                  Parts
                </label>
                <textarea
                  id="parts"
                  value={parts || extractedParts}
                  onChange={(e) => setParts(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label htmlFor="regexPrompt" className="block text-sm font-medium text-gray-700">
                  Regex Prompt
                </label>
                <textarea
                  id="regexPrompt"
                  value={regexPrompt || refinedPrompt}
                  onChange={(e) => setRegexPrompt(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={4}
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleRegexGenerator}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Generate Regex
            </button>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Run Full Process'}
          </button>
        </form>
      </div>

      <div className="w-1/2">
        <BlueprintResponse 
          loading={loading} 
          result={result}
          refinedPrompt={refinedPrompt}
          extractedParts={extractedParts}
        />
      </div>
    </div>
  );
}
