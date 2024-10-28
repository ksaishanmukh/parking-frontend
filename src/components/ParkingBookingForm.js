import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Cookies from 'universal-cookie';

function ParkingBookingForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        vehicle_no: '',
        slot: '',
        time: '',
    });
    const [locations, setLocations] = useState([]);
    const [malls, setMalls] = useState([]);
    const [floors, setFloors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [slot, setSlotId] = useState('');
    const [tempData, setTempData] = useState({
        location: '',
        mall: '',
        floor: ''
    });

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
            if (!tempData.location) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:3000/malls?location=${tempData.location}`);
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
    }, [tempData.location]);

    useEffect(() => {
        const fetchFloors = async () => {
            if (!tempData.mall) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:3000/slots/floors?mall_id=${tempData.mall}`);
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
    }, [tempData.mall]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!tempData.floor || !tempData.mall) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:3000/slots?mall_id=${tempData.mall}&floor_no=${tempData.floor}`);
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
    }, [tempData.floor, tempData.mall]);

    useEffect(() => {
        const cookies = new Cookies();
        const activeBooking = cookies.get('activeBooking');

        if (!activeBooking) {
            if (formData.slot) {
                cookies.set('activeBooking', formData.slot, { path: '/', maxAge: 60 * 60 * 24 });
            }
        } else {
            fetch('http://localhost:3000/book?slot_id=' + activeBooking)
                .then((res) => res.json())
                .then((data) => {
                    if (data.length < 1) {
                        cookies.remove('activeBooking');
                    }
                    else {
                        setSlotId(activeBooking);
                        setStep(5);
                    }
                });

        }
    }, [formData.slot]);

    const handleNextStep = () => {
        if (step === 3) {
            const time = slotTime().toTimeString().slice(0, 5) + ":00";
            setFormData({ ...formData, time });
        }
        setStep((prevStep) => prevStep + 1);
    };

    const handlePrevStep = () => setStep((prevStep) => prevStep - 1);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleTemp = (e) => setTempData({ ...tempData, [e.target.name]: e.target.value });

    const isStepValid = () => {
        if (step === 1) return formData.name && formData.phone.length === 10;
        if (step === 2) return tempData.location && tempData.mall;
        if (step === 3) return formData.slot;
        return true;
    };

    const handleSlotSelection = (slot) => slot.is_available && setFormData({ ...formData, slot: slot.id });

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3000/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: formData.name, phone: formData.phone, vehicle_no: formData.vehicle_no }),
        })
            .then((res) => res.json())
            .then((data) => {
                return fetch('http://localhost:3000/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: data.id, slot_id: formData.slot, time: formData.time }),
                });
            })
            .then((res) => res.json())
            .catch((err) => console.error(err));

        fetch(`http://localhost:3000/slots`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: formData.slot, is_available: false }),
        });
        setSlotId(formData.slot);
        setStep(5);

    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isStepValid()) {
            handleNextStep();
        }
    };

    const slotTime = () => {
        return new Date(new Date().getTime() + 1800000);
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 text-white rounded-xl shadow-lg p-8 transition-all duration-300">
                <h1 className="text-3xl font-semibold mb-6 text-center">Parking Slot Booking</h1>

                {/* Error Message */}
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {/* Loading Indicator */}
                {loading && <p className="text-yellow-500">Loading...</p>}


                {/* Step 1: User Details */}
                {step === 1 && (
                    <div>
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
                        <input
                            type="text"
                            name="vehicle_no"
                            value={formData.vehicle_no}
                            onChange={handleChange}
                            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="Enter your vehicle number"
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
                )}

                {/* Step 2: Location and Mall Selection */}
                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Select Location and Mall</h2>
                        <select
                            name="location"
                            value={tempData.location}
                            onChange={handleTemp}
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
                            value={tempData.mall}
                            onChange={handleTemp}
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
                )}

                {/* Step 3: Floor and Slot Selection */}
                {step === 3 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Select Floor and Slot</h2>
                        <select
                            name="floor"
                            value={tempData.floor}
                            onChange={handleTemp}
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
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Confirmation</h2>
                        <p className="text-lg mb-2 pl-8"><span className="font-bold text-xl">Name: </span>{formData.name}</p>
                        <p className="text-lg mb-2 pl-8"><span className='font-bold text-xl'>Phone: </span>{formData.phone}</p>
                        <p className="text-lg mb-2 pl-8"><span className='font-bold text-xl'>Vehicle No.: </span>{formData.vehicle_no}</p>
                        <p className="text-lg mb-2 pl-8"><span className='font-bold text-xl'>Slot Time: </span>{formData.time}</p>

                        <div className="flex space-x-4 pt-4">
                            <button onClick={handlePrevStep} className="w-1/2 p-3 bg-gray-500 rounded-lg">
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`w-1/2 p-3 rounded-lg ${isStepValid() ? 'bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Success Screen */}
                {step === 5 && (
                    <div className="text-center">
                        <p className="text-lg mb-2">Your booking ID is:</p>
                        <p className="text-2xl font-bold mb-4">{slot}</p>
                        <QRCodeSVG value={JSON.stringify(slot)} className="mx-auto" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ParkingBookingForm;
