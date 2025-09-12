"use client";

type Props = {
    channel: any;
    onBackClick: () => void;
    onVideoSelect: (video: any) => void;
    onAddVideoClick: () => void;
};

export default function ChannelView({ channel, onBackClick, onVideoSelect, onAddVideoClick }: Props) {
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-8 text-center">
            <button className="mb-6 text-blue-700 font-semibold flex items-center mx-auto hover:text-indigo-800 transition-colors duration-300" onClick={onBackClick}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
            </button>
            <div className="bg-white bg-opacity-80 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto mb-8 backdrop-blur-sm">
                <img
                    src={channel.profileImage || "/default.png"}
                    alt="channel"
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-300 shadow-md object-cover"
                />
                <h2 className="text-3xl font-bold text-blue-800 mb-2">{channel.name}</h2>
                <p className="text-gray-700">{channel.description}</p>
            </div>

            <h3 className="text-2xl font-semibold mt-8 mb-6 text-blue-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">Videos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {Array.isArray(channel.videos) && channel.videos.length > 0 ? (
                    channel.videos.map((vid: any, idx: number) => (
                        <div
                            key={idx}
                            className="p-3 bg-white bg-opacity-90 rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-100 backdrop-blur-sm"
                            onClick={() => onVideoSelect(vid)}
                        >
                            <img
                                src={vid.videoThumbnail}
                                alt="video"
                                className="w-full h-40 object-cover rounded-lg mb-3 shadow-md"
                            />
                            <p className="text-base font-semibold text-blue-800">{vid.title}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-600 bg-white bg-opacity-70 p-6 rounded-xl shadow-md col-span-full backdrop-blur-sm">No videos yet — add the first one!</div>
                )}
            </div>

            <button
                onClick={onAddVideoClick}
                className="mt-8 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 font-semibold"
            >
                + Add Video
            </button>
        </div>
    );
}