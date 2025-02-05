import React from "react";

const FormModal = ({ onClose, message, isError }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p
                    className={`text-lg font-semibold mb-4 ${
                        isError ? "text-red-600" : "text-green-600"
                    }`}
                >
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="bg-customBlue text-white px-6 py-2 rounded-lg hover:bg-blue-800"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default FormModal;
