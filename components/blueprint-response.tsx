interface BlueprintResponseProps {
  loading: boolean;
  result: string;
  refinedPrompt: string;
  extractedParts: string;
}

export default function BlueprintResponse({ loading, result, refinedPrompt, extractedParts }: BlueprintResponseProps) {
  return (
    <div className="space-y-4">
      {loading && <div className="text-gray-500">Processing...</div>}
      
      {refinedPrompt && (
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Refined Prompt:</h3>
          <pre className="bg-gray-50 p-2 rounded whitespace-pre-wrap">{refinedPrompt}</pre>
        </div>
      )}

      {extractedParts && (
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Extracted Parts:</h3>
          <pre className="bg-gray-50 p-2 rounded whitespace-pre-wrap">{extractedParts}</pre>
        </div>
      )}

      {result && (
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Final Result:</h3>
          <pre className="bg-gray-50 p-2 rounded whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
} 