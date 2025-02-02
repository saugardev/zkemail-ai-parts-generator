'use client';

import { useState } from 'react';
import BlueprintResponse from './blueprint-response';

// UI Components
const TextArea = ({ id, label, value, onChange }: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      rows={4}
      required
    />
  </div>
);

const FileInput = ({ id, label, onChange }: {
  id: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="file"
      id={id}
      accept=".eml"
      onChange={onChange}
      className="mt-1 block w-full"
      required
    />
  </div>
);

const ProcessSection = ({ title, children, loading, onExecute }: {
  title: string;
  children: React.ReactNode;
  loading: boolean;
  onExecute: () => void;
}) => (
  <section className="border p-4 rounded-lg">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <div className="space-y-4">
      {children}
    </div>
    <button
      type="button"
      onClick={onExecute}
      disabled={loading}
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {title.split('.')[1]}
    </button>
  </section>
);

const SubmitButton = ({ loading }: { loading: boolean }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
  >
    {loading ? 'Processing...' : 'Run Full Process'}
  </button>
);

export default function BlueprintGenerator() {
  // Parts Extractor
  const [instructions, setInstructions] = useState('');
  const [emlFile, setEmlFile] = useState<File | null>(null);
  const [extractedParts, setExtractedParts] = useState('');

  // Regex Generator
  const [parts, setParts] = useState('');
  const [result, setResult] = useState('');

  const [loading, setLoading] = useState(false);

  const handlePartsExtractor = async () => {
    setLoading(true);
    try {
      // Convert file to base64 if it exists
      let fileData = '';
      if (emlFile) {
        fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(emlFile);
        });
      }

      const extractorRes = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: JSON.stringify({
            instructions: instructions,
            fileContent: fileData
          }),
          agentType: 'partsExtractor'
        }),
      });
      const { result } = await extractorRes.json();
      setExtractedParts(result[0]);
      setParts(result[0]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegexGenerator = async () => {
    setLoading(true);
    try {
      const regexRes = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: JSON.stringify({
            parts: extractedParts ? JSON.parse(extractedParts) : [],
            instructions: instructions
          }),
          agentType: 'regexGenerator'
        }),
      });
      const { result } = await regexRes.json();
      setResult(result[0]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFullProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First request: partsExtractor
      let fileData = '';
      if (emlFile) {
        fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(emlFile);
        });
      }
      const extractorRes = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: JSON.stringify({
            instructions: instructions,
            fileContent: fileData
          }),
          agentType: 'partsExtractor'
        }),
      });
      const { result: extractorResult } = await extractorRes.json();
      const extractedParts = extractorResult[0];
      setExtractedParts(JSON.stringify(extractedParts));

      // Second request: regexGenerator
      const regexRes = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: JSON.stringify({
            parts: extractedParts,
            instructions: instructions
          }),
          agentType: 'regexGenerator'
        }),
      });
      const { result: regexResult } = await regexRes.json();
      setResult(regexResult[0]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-8">
      <div className="w-1/2">
        <form onSubmit={handleFullProcess} className="space-y-8">
          {/* Parts Extractor Section */}
          <ProcessSection
            title="1. Parts Extractor"
            loading={loading}
            onExecute={handlePartsExtractor}
          >
            <TextArea
              id="instructions"
              label="Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <FileInput
              id="emlFile"
              label="EML File"
              onChange={(e) => setEmlFile(e.target.files?.[0] || null)}
            />
          </ProcessSection>

          {/* Regex Generator Section */}
          <ProcessSection
            title="2. Regex Generator"
            loading={loading}
            onExecute={handleRegexGenerator}
          >
            <TextArea
              id="parts"
              label="Parts"
              value={parts || extractedParts}
              onChange={(e) => setParts(e.target.value)}
            />
          </ProcessSection>

          <SubmitButton loading={loading} />
        </form>
      </div>

      <div className="w-1/2">
        <BlueprintResponse 
          loading={loading} 
          result={result}
          extractedParts={extractedParts}
        />
      </div>
    </div>
  );
}
