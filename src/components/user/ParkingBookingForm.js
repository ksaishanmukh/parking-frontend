import { useState, useRef, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import 'animate.css';

import TimePicker from './TimePicker';

function ParkingBookingForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        mall: '',
        floor: 0,
        slot: null,
        time: '',
        duration: ''
    });
    const [locations, setLocations] = useState([]);
    const [malls, setMalls] = useState([]);
    const [floors, setFloors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const stepRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('http://localhost:3000/malls/locations');
                if (!res.ok) throw new Error('Failed to fetch locations');
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (step === 1) fetchLocations();
    }, [step]);

    useEffect(() => {
        const fetchMalls = async () => {
            if (!formData.location) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:3000/malls?location=${formData.location}`);
                if (!res.ok) throw new Error('Failed to fetch malls');
                const data = await res.json();
                setMalls(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMalls();
    }, [formData.location]);

    useEffect(() => {
        const fetchFloors = async () => {
            if (!formData.mall) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:3000/slots/floors?mall_id=${formData.mall}`);
                if (!res.ok) throw new Error('Failed to fetch floors');
                const data = await res.json();
                setFloors(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFloors();
    }, [formData.mall]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!formData.floor || !formData.mall) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:3000/slots?mall_id=${formData.mall}&floor_no=${formData.floor}`);
                if (!res.ok) throw new Error('Failed to fetch slots');
                const data = await res.json();
                setSlots(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [formData.floor, formData.mall]);

    const handleNextStep = () => {
        setStep((prevStep) => prevStep + 1);
    };

    const handlePrevStep = () => setStep((prevStep) => prevStep - 1);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const isStepValid = () => {
        if (step === 1) return formData.name && formData.phone.length === 10;
        if (step === 2) return formData.location && formData.mall;
        if (step === 3) return formData.slot;
        if (step === 4) return formData.time && formData.duration;
        return true;
    };

    const handleSlotSelection = (slot) => slot.is_available && setFormData({ ...formData, slot: slot.id });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        // Submit form data here
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isStepValid()) {
            handleNextStep();
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 text-white rounded-xl shadow-lg p-8 transition-all duration-300">
                <h1 className="text-3xl font-semibold mb-6 text-center">Parking Slot Booking</h1>

                {/* Error Message */}
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {/* Loading Indicator */}
                {loading && <p className="text-yellow-500">Loading...</p>}

                {/* Step 1: User Details */}
                <CSSTransition
                    in={step === 1}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                    nodeRef={stepRefs[0]}
                >
                    <div ref={stepRefs[0]} className="animate__animated animate__fadeIn">
                        <h2 className="text-xl font-bold mb-4">User Information</h2>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="Enter your name"
                            onKeyDown={handleKeyDown}
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="Enter your phone number"
                            maxLength={10}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleNextStep}
                            disabled={!isStepValid()}
                            className={`w-full p-3 rounded-lg ${isStepValid() ? 'bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
                        >
                            Next
                        </button>
                    </div>
                </CSSTransition>

                {/* Step 2: Location and Mall Selection */}
                <CSSTransition
                    in={step === 2}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                    nodeRef={stepRefs[1]}
                >
                    <div ref={stepRefs[1]} className="animate__animated animate__fadeIn">
                        <h2 className="text-xl font-bold mb-4">Select Location and Mall</h2>
                        <select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        >
                            <option value="">Select Location</option>
                            {locations.map((location) => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                        </select>
                        <select
                            name="mall"
                            value={formData.mall}
                            onChange={handleChange}
                            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        >
                            <option value="">Select Mall</option>
                            {malls.map((mall) => (
                                <option key={mall.id} value={mall.id}>
                                    {mall.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex space-x-4">
                            <button onClick={handlePrevStep} className="w-1/2 p-3 bg-gray-500 rounded-lg">
                                Back
                            </button>
                            <button
                                onClick={handleNextStep}
                                disabled={!isStepValid()}
                                className={`w-1/2 p-3 rounded-lg ${isStepValid() ? 'bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </CSSTransition>

                {/* Step 3: Floor and Slot Selection */}
                <CSSTransition
                    in={step === 3}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                    nodeRef={stepRefs[2]}
                >
                    <div ref={stepRefs[2]} className="animate__animated animate__fadeIn">
                        <h2 className="text-xl font-bold mb-4">Select Floor and Slot</h2>
                        <select
                            name="floor"
                            value={formData.floor}
                            onChange={handleChange}
                            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        >
                            <option value="">Select Floor</option>
                            {floors.map((floor) => (
                                <option key={floor} value={floor}>
                                    Floor {floor}
                                </option>
                            ))}
                        </select>
                        <div className="grid grid-cols-3 gap-4 pb-4">
                            {slots.map((slot) => (
                                <div
                                    key={slot.id}
                                    onClick={() => handleSlotSelection(slot)}
                                    className={`p-4 text-center rounded-lg cursor-pointer
                                    ${slot.is_available ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 cursor-not-allowed'}
                                    ${formData.slot === slot.id ? 'ring-4 ring-blue-500' : ''}`}
                                >
                                    {slot.slot_no}
                                </div>
                            ))}
                        </div>
                        <div className="flex space-x-4">
                            <button onClick={handlePrevStep} className="w-1/2 p-3 bg-gray-500 rounded-lg">
                                Back
                            </button>
                            <button
                                onClick={handleNextStep}
                                disabled={!isStepValid()}
                                className={`w-1/2 p-3 rounded-lg ${isStepValid() ? 'bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </CSSTransition>

                {/* Step 4: Time and Duration Selection */}
                <CSSTransition
                    in={step === 4}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                    nodeRef={stepRefs[3]}
                >
                    <div ref={stepRefs[3]} className="animate__animated animate__fadeIn">
                        <h2 className="text-xl font-bold mb-4">Select Time and Duration</h2>
                        <TimePicker time={formData.time} onChange={(newTime) => setFormData({ ...formData, time: newTime })} />
                        <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="Enter duration (in hours)"
                            onKeyDown={handleKeyDown}
                        />
                        <div className="flex space-x-4">
                            <button onClick={handlePrevStep} className="w-1/2 p-3 bg-gray-500 rounded-lg">
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!isStepValid()}
                                className={`w-1/2 p-3 rounded-lg ${isStepValid() ? 'bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </CSSTransition>
            </div>
        </div>
    );
}

export default ParkingBookingForm;
