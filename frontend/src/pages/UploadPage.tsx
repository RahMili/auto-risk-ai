import UploadForm from "../components/upload/UploadForm";

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Upload your resume
      </h2>
      <p className="text-gray-500 text-center mb-10">
        We'll extract the text so you can review it before analysis.
      </p>
      <UploadForm />
    </div>
  );
}