import { useState, useEffect } from 'react';

function LoginForm({ onLoginSuccess, onToggle }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        fetch('http://localhost:3000/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.id) {
                    onLoginSuccess(data.id);
                }
            })
            .catch((err) => console.log(err));
        setIsSubmitting(false);
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-white w-full max-w-md transition-all duration-300">
            <h2 className="text-3xl font-semibold mb-6 text-center">Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4 p-3 w-full bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-4 p-3 w-full bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full p-3 rounded-lg ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-all duration-300`}
                >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="mt-4 text-sm text-gray-400 text-center">
                Don't have an account?{' '}
                <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={onToggle}
                >
                    Register here
                </span>
            </p>
        </div>
    );
}

function RegisterForm({ onToggle }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            alert('Phone number must be 10 digits long');
            setIsSubmitting(false);
            return;
        }

        const res = await fetch('http://localhost:3000/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password }),
        });

        if (res.ok) {
            onToggle();
        } else {
            alert('Registration failed');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-white w-full max-w-md transition-all duration-300">
            <h2 className="text-3xl font-semibold mb-6 text-center">Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-4 p-3 w-full bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4 p-3 w-full bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                />
                <input
                    type="text"
                    placeholder="Phone Number (10 digits)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mb-4 p-3 w-full bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-4 p-3 w-full bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mb-4 p-3 w-full bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full p-3 rounded-lg ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-all duration-300`}
                >
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="mt-4 text-sm text-gray-400 text-center">
                Already have an account?{' '}
                <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={onToggle}
                >
                    Login here
                </span>
            </p>
        </div>
    );
}

function RegisterMall({ adminId, onRegister }) {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        floors: '',
        slots: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:3000/malls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_id: adminId, name: formData.name, location: formData.location }),
            })
                .then((res) => res.json())
                .then(async (data) => {
                    if (data.id) {
                        console.log(data.id);
                        for (let i = 1; i <= formData.floors; i++) {
                            for (let j = 1; j <= formData.slots; j++) {
                                await fetch('http://localhost:3000/slots', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ mall_id: data.id, floor_no: i, slot_no: j }),
                                });
                            }
                        }
                        onRegister(data.id);
                    }
                })

        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 text-white rounded-xl shadow-lg p-8 transition-all duration-300">
                <h1 className="text-3xl font-semibold mb-6 text-center">Mall Registration</h1>
                <div>
                    <h2 className="text-xl font-bold mb-4">Mall Information</h2>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        placeholder="Enter your mall name"
                    />
                    <input
                        type="tel"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        placeholder="Enter your mall location"
                        maxLength={10}
                    />
                    <input
                        type="number"
                        name="floors"
                        value={formData.floors}
                        onChange={handleChange}
                        className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        placeholder="Enter floors available"
                        maxLength={10}
                    />
                    <input
                        type="number"
                        name="slots"
                        value={formData.slots}
                        onChange={handleChange}
                        className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        placeholder="Enter slots per floor"
                        maxLength={10}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={formData.name === '' || formData.location === '' || formData.floors === 0 || formData.slots === 0}
                        className={`w-full p-3 rounded-lg ${true ? 'bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}

function Dashboard({ mallId }) {
    const [tempData, setTempData] = useState({ mall: mallId, floor: '', name: '', phone: '', vehicle_no: '' });
    const [floors, setFloors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [step, setStep] = useState(1);

    const handleTemp = (e) => setTempData({ ...tempData, [e.target.name]: e.target.value });

    useEffect(() => {
        const fetchFloors = async () => {
            if (!tempData.mall) return;
            try {
                const res = await fetch(`http://localhost:3000/slots/floors?mall_id=${tempData.mall}`);
                if (!res.ok) throw new Error('Failed to fetch floors');
                const data = await res.json();
                setFloors(data);
            } catch (err) {
                console.log(err.message);
            }
        };

        fetchFloors();
    }, [tempData.mall]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!tempData.floor || !tempData.mall) return;
            try {
                const res = await fetch(`http://localhost:3000/slots?mall_id=${tempData.mall}&floor_no=${tempData.floor}`);
                if (!res.ok) throw new Error('Failed to fetch slots');
                const data = await res.json();
                setSlots(data);
            } catch (err) {
                console.log(err.message);
            }
        };

        fetchSlots();
    }, [tempData.floor, tempData.mall]);

    const handleSlotSelection = (slot) => {
        if (!slot.is_available) {
            fetch("http://localhost:3000/slots/admin?slot_id=" + slot.id)
                .then((res) => res.json())
                .then((data) => {
                    setTempData({ ...tempData, name: data[0].name, phone: data[0].phone, vehicle_no: data[0].vehicle_no });
                });
            setStep(2);
        }
    };

    return (
        <>
            {step === 1 && (
                <div className='text-white'>
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
                        ${slot.is_available ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600'}`}
                            >
                                {slot.slot_no}
                            </div>
                        ))}
                    </div>
                </div>)
            }

            {step === 2 && (
                <div className='text-white'>
                    <h2 className="text-2xl font-bold mb-4">Details</h2>
                    <p className="text-lg mb-2 pl-8"><span className="font-bold text-xl">Name: </span>{tempData.name}</p>
                    <p className="text-lg mb-2 pl-8"><span className='font-bold text-xl'>Phone: </span>{tempData.phone}</p>
                    <p className="text-lg mb-2 pl-8"><span className='font-bold text-xl'>Vehicle No.: </span>{tempData.vehicle_no}</p>
                    <div className="flex space-x-4 pt-4">
                        <button
                            onClick={() => setStep(1)}
                            className={"w-1/2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700"}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

function AdminDashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [isRegisterd, setIsRegisterd] = useState(false);
    const [adminId, setAdminId] = useState('');
    const [mallId, setMallId] = useState('');

    const handleLoginSuccess = async (id) => {
        setAdminId(id);
        fetch('http://localhost:3000/malls/admin?id=' + id)
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setMallId(data[0].id);
                    setIsRegisterd(true);
                }
            })
            .catch((err) => console.log(err));
        setIsLoggedIn(true);
    };

    const handleOnRegister = async (id) => {
        setMallId(id);
    }

    const toggleForm = () => {
        setShowRegister(!showRegister);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col p-4 items-center justify-center">
            {!isLoggedIn ? (
                <>
                    {showRegister ? <RegisterForm onToggle={toggleForm} /> : <LoginForm onLoginSuccess={handleLoginSuccess} onToggle={toggleForm} />}
                </>
            ) : (
                <>
                    {!isRegisterd ? <RegisterMall adminId={adminId} onRegister={handleOnRegister} /> : <Dashboard mallId={mallId} />}
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
