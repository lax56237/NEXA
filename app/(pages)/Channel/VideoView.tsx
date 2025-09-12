"use client";

type Props = {
    video: any;
    onBackClick: () => void;
};

export default function VideoView({ video, onBackClick }: Props) {
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-8 text-center">
            <button className="mb-6 text-blue-700 font-semibold flex items-center mx-auto hover:text-indigo-800 transition-colors duration-300" onClick={onBackClick}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Channel
            </button>
            <div className="bg-white bg-opacity-80 rounded-2xl shadow-lg p-6 max-w-5xl mx-auto mb-8 backdrop-blur-sm">
                <div className="aspect-video w-full mx-auto overflow-hidden rounded-xl shadow-lg border-2 border-blue-200">
                    <video
                        controls
                        className="w-full h-full object-contain bg-black"
                        src={video.video}
                        poster={video.videoThumbnail}
                        preload="metadata"
                    />
                </div>
            </div>
            <div className="bg-white bg-opacity-70 rounded-xl shadow-lg p-6 max-w-3xl mx-auto backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-blue-800 mb-3">{video.title}</h2>
                <p className="text-gray-700">{video.description}</p>
            </div>
        </div>
    );
}