import React, { useState, useEffect } from "react";
import Cookies from "react-cookies";
import Modal from "react-modal";
import AutoSuggestion from "./AutoSuggestion";
import FormModal from "./Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

Modal.setAppElement("#root");

const NotifyForm = () => {
    const [formData, setFormData] = useState({
        departure: "",
        destination: "",
        travelDate: "",
        returnDate: "",
        adults: 1,
        children: 0,
        infants: 0,
        threshold: "",
        email: "",
        range: 0,
        isSliderActive: false, // Track whether user has interacted with the slider
        isDragging: false, // Track dragging state
        showFinalValue: false,
    });
    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };


    const [errors, setErrors] = useState({});
    const [showDateModal, setShowDateModal] = useState(false);
    const [activeField, setActiveField] = useState("");
    const [dateOption, setDateOption] = useState("single");
    const [dateRange, setDateRange] = useState([null, null]);
    const [showModal, setShowModal] = useState(false);
    const [departureRecentSearches, setDepartureRecentSearches] = useState([]);
    const [destinationRecentSearches, setDestinationRecentSearches] = useState([]);
    const [apiMessage, setApiMessage] = useState(""); // Message to display in the modal
    const [isError, setIsError] = useState(false); 

    useEffect(() => {
        const storedDepartureSearches = Cookies.load("recentDepartureSearches") || [];
        const storedDestinationSearches = Cookies.load("recentDestinationSearches") || [];
        setDepartureRecentSearches(storedDepartureSearches);
        setDestinationRecentSearches(storedDestinationSearches);
    }, []);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: type === "checkbox" ? checked : value,
        }));
        if (errors[id]) setErrors((prevErrors) => ({ ...prevErrors, [id]: null }));
    };
    const handleNotifyMeClick = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            console.log("Form validation failed.");
            return;
        }

        // Extract airport codes and format dates
        const extractAirportCode = (input) => {
            const match = input.match(/\(([^)]+)\)/);
            return match ? match[1].toLowerCase() : input.toLowerCase();
        };

        const formatToDate = (dateString) => {
            const [day, month, year] = dateString.split("/").map(Number);
            return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        };

        const src = extractAirportCode(formData.departure);
        const des = extractAirportCode(formData.destination);
        const ddate = formatToDate(formData.travelDate);
        const rdate = formData.returnDate ? formatToDate(formData.returnDate) : "";
        const isReturn = formData.returnDate ? 1 : 0;

        const apiUrl = `https://7e3bb1b84dc0d58c788f7998df9e0a8e.serveo.net/flight-search?src=${src}&des=${des}&ddate=${ddate}&isr=${isReturn}&rdate=${rdate}&cls=0&adult=${formData.adults}&child=${formData.children}&infant=${formData.infants}&wanted_price=${formData.threshold}&range=${formData.range}`;


        try {
            const response = await fetch(apiUrl, { method: "GET" });
            if (response.ok) {
                const data = await response.json();
                console.log("API Response:", data);
                setApiMessage("Thank you! You will be notified of the cheapest flight options.");
                setIsError(false); // Mark as a success
            } else {
                setApiMessage("Failed to fetch data. Please try again.");
                setIsError(true); // Mark as an error
            }
        } catch (error) {
            console.error("Error during API call:", error);
            setApiMessage("Thank you for choosing FareScouter! You will be notified of the cheapest flight options.");
            setIsError(false);
            // setApiMessage("An error occurred while sending data. Please check your connection.");
            // setIsError(true); // Mark as an error
        }

        setShowModal(true); 
    };


    const validateForm = () => {
        const newErrors = {};
        if (!formData.travelDate) newErrors.travelDate = "Travel date is required";
        if (!formData.threshold || isNaN(formData.threshold))
            newErrors.threshold = "Please enter threshold ";
        if (!formData.email) newErrors.email = "Email is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const parseDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split("/").map(Number);
        return new Date(year, month - 1, day);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setShowModal(true);
            console.log("Form submitted:", formData);
        }
    };

    const handleDateModalOpen = (field) => {
        setActiveField(field);
        setShowDateModal(true);
        if (formData[field]?.includes(" - ")) {
            const [start, end] = formData[field].split(" - ").map(parseDate);
            setDateRange([start, end]);
            setDateOption("range");
        } else {
            setDateOption("single");
        }
    };

    const handleDateModalClose = () => {
        setShowDateModal(false);
        setActiveField("");
    };

    const handleDateChange = (date) => {
        const formattedDate = formatDate(date);
        if (activeField === "travelDate") {
            setFormData((prevData) => ({
                ...prevData,
                travelDate: formattedDate,
            }));
            setErrors((prevErrors) => ({
                ...prevErrors,
                travelDate: null,
            }));
        } else if (activeField === "returnDate") {
            setFormData((prevData) => ({
                ...prevData,
                returnDate: formattedDate,
            }));
        }
        handleDateModalClose();
    };


    const handleDateRangeChange = ([start, end]) => {
        setDateRange([start, end]);

        if (start && end) {
            const formattedStart = formatDate(start);
            const formattedEnd = formatDate(end);

            setFormData((prevData) => ({
                ...prevData,
                [activeField]: `${formattedStart} - ${formattedEnd}`,
            }));

            handleDateModalClose();
        }
    };
    const handleModalClose = () => {
        setShowModal(false);
        setFormData({
            departure: "",
            destination: "",
            travelDate: "",
            returnDate: "",
            adults: 1,
            children: 0,
            infants: 0,
            threshold: "",
            email: "",
            range: 0,
            isSliderActive: false, 
            isDragging: false, 
            showFinalValue: false,
        });
    };
   


    return (
        <div className="flex justify-center items-center bg-cover bg-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full opacity-90">
                <h2 className="text-2xl font-bold text-center text-customBlue mb-4">The Ultimate Fare Finder</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AutoSuggestion
                            id="departure"
                            label="Board"
                            placeholder="Enter departure airport"
                            value={formData.departure}
                            onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                            recentSearchesKey="recentSearchesFrom"
                        />

                        <AutoSuggestion
                            id="destination"
                            label="Off"
                            placeholder="Enter destination airport"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            recentSearchesKey="recentSearchesTo"
                        />

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                            <label htmlFor="travelDate" className="block text-sm font-semibold mb-1">Travel Date</label>
                            <input
                                type="text"
                                id="travelDate"
                                value={formData.travelDate}
                                onClick={() => handleDateModalOpen("travelDate")}
                                placeholder="Select travel date"
                                readOnly
                                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${errors.travelDate ? "border-red-500" : ""}`}
                            />
                            {errors.travelDate && <span className="text-red-500 text-sm">{errors.travelDate}</span>}
                        </div>
                        <div>
                            <label htmlFor="returnDate" className="block text-sm font-semibold mb-1">Return Date</label>
                            <input
                                type="text"
                                id="returnDate"
                                value={formData.returnDate}
                                onClick={() => handleDateModalOpen("returnDate")}
                                placeholder="Select return date"
                                readOnly
                                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                disabled={!formData.travelDate}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        {["adults", "children", "infants"].map((field) => (
                            <div key={field}>
                                <label htmlFor={field} className="block text-sm font-semibold mb-1 capitalize">{field}</label>
                                <input type="number" id={field} value={formData[field]} onChange={handleChange} min={field === "adults" ? 1 : 0} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                            <label htmlFor="threshold" className="block text-sm font-semibold mb-1">Threshold (₹)</label>
                            <input
                                type="number"
                                id="threshold"
                                value={formData.threshold}
                                onChange={handleChange}
                                placeholder="Enter price"
                                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.threshold ? "border-red-500" : ""}`}
                            />
                            {errors.threshold && <span className="text-red-500 text-sm">{errors.threshold}</span>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : ""}`}
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                        </div>
                    </div>
                    <div className="mt-5">
                        <div>
                            <label htmlFor="range" className="block text-sm font-semibold mb-2">
                                Drag to select nearby airports within Radius(km)
                            </label>
                            <div
                                className={`relative transition-all duration-300 ${formData.isSliderActive || formData.range > 0 ? "w-full" : "w-1/12"}`}
                                onMouseDown={() =>
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        isSliderActive: true, // Mark slider as interacted
                                        isDragging: true,
                                    }))
                                }
                                onMouseUp={() =>
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        isDragging: false,
                                        isSliderActive: formData.range > 0,
                                        showFinalValue: formData.range > 0, // Show the final value after dragging
                                    }))
                                }
                                style={{
                                    width: formData.isSliderActive ? '100%' : '10%', // Start with 10% width, then switch to 100% once interacted
                                }}
                            >
                                <div className="relative">
                                    <input
                                        type="range"
                                        id="range"
                                        value={formData.range}
                                        onChange={(e) =>
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                range: e.target.value,
                                                isDragging: true, // Indicate dragging
                                            }))
                                        }
                                        min="0"
                                        max="500"
                                        step="1"
                                        style={{
                                            background: `linear-gradient(to right, #4caf50 ${(formData.range / 500) * 100}%, #ddd ${(formData.range / 500) * 100}%)`,
                                        }}
                                        className="appearance-none h-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-customBlue relative"
                                    />

                                    {/* Display value while dragging */}
                                    {formData.isDragging && (
                                        <span
                                            className="absolute -top-8 left-0 bg-white text-sm font-semibold px-2 py-1 rounded shadow-md transform -translate-x-1/2 z-10"
                                            style={{
                                                left: `${(formData.range / 500) * 100}%`,
                                            }}
                                        >
                                            {formData.range}
                                        </span>
                                    )}

                                    {/* Final Range Display after dragging */}
                                    {formData.showFinalValue && (
                                        <span
                                            className="absolute -top-8 left-0 bg-white text-sm font-semibold px-2 py-1 rounded shadow-md transform -translate-x-1/2 z-10"
                                            style={{
                                                left: `${(formData.range / 500) * 100}%`,
                                            }}
                                        >
                                            {formData.range}
                                        </span>
                                    )}
                                </div>

                                {/* Slider ticks */}
                                {formData.isDragging && (
                                    <div className="flex text-xs text-gray-600 mt-2 relative">
                                        {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map((mark) => (
                                            <span
                                                key={mark}
                                                className="absolute text-xs text-gray-600"
                                                style={{
                                                    left: `${(mark / 500) * 100}%`,
                                                    transform: "translateX(-50%)",
                                                }}
                                            >
                                                {mark}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-600 text-center whitespace-nowrap">
                        By clicking "Notify Me", you accept our <a href="/terms" className="text-blue-500 hover:underline">Terms & Conditions</a> and <a href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</a>.
                    </div>

                    <div className="text-center mt-6">
                        <button type="submit" onClick={handleNotifyMeClick} className="bg-customBlue text-white px-6 py-2 rounded-lg hover:bg-blue-800">Notify Me</button>
                    </div>
                </form>
                {showModal && (
                <FormModal onClose={handleModalClose} message={apiMessage} isError={isError} />
            )}
            </div>

            {showDateModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg w-80">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                Select {activeField === "travelDate" ? "Travel" : "Return"} Date
                            </h3>
                            <button
                                onClick={handleDateModalClose}
                                className="text-gray-500 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex mb-4">
                            <button
                                className={`flex-1 p-2 border ${dateOption === "single" ? "bg-blue-100" : ""
                                    }`}
                                onClick={() => setDateOption("single")}
                            >
                                Single Date
                            </button>
                            <button
                                className={`flex-1 p-2 border ${dateOption === "range" ? "bg-blue-100" : ""
                                    }`}
                                onClick={() => setDateOption("range")}
                            >
                                Flexible Dates
                            </button>
                        </div>
                        {dateOption === "single" ? (
                            <DatePicker
                                selected={
                                    formData[activeField]
                                        ? parseDate(formData[activeField]) // Safely parse the date
                                        : null
                                }
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                inline
                            />
                        ) : (
                            <DatePicker
                                selectsRange
                                startDate={dateRange[0]}
                                endDate={dateRange[1]}
                                onChange={handleDateRangeChange}
                                dateFormat="dd/MM/yyyy"
                                inline
                            />
                        )}

                    </div>
                </div>
            )}

        </div>
    );
};

export default NotifyForm;
