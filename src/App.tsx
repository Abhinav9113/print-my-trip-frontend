import ImageUploader from "./components/ImageUploader";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-1 bg-gray-100">
      <div className="w-full max-w-xl  bg-white py-2  shadow rounded">
        <h1 className="text-xl font-bold text-center mb-4">Print Your Trip</h1>
        <ImageUploader />
      </div>
    </div>
  );
}

export default App;
