import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full w-full min-h-[50vh]">
            <div className="relative">
                <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
                <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-indigo-600 border-t-transparent shadow-md"></div>
            </div>
        </div>
    );
};

export default Loading;
