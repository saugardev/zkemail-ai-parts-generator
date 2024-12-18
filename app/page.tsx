import BlueprintGenerator from '@/components/blueprint-generator';

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            ZK Email Blueprint Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Generate ZK email verification circuit blueprints powered by AI
          </p>
        </div>
        <BlueprintGenerator />
      </div>
    </main>
  );
}
