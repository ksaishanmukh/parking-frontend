import { useEffect, useState, useCallback } from "react";

function TimePicker({ time, onChange }) {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = [0, 15, 30, 45];

    const [selectedHour, setSelectedHour] = useState(time ? parseInt(time.split(':')[0]) : 12);
    const [selectedMinute, setSelectedMinute] = useState(time ? parseInt(time.split(':')[1]) : 0);
    const [isAm, setIsAm] = useState(time ? time.includes('AM') : true);
    const updateTime = useCallback((hour, minute, am) => {
        const newTime = `${hour}:${minute < 10 ? '0' + minute : minute} ${am ? 'AM' : 'PM'}`;
        onChange(newTime);
    });

    useEffect(() => {
        const currentDate = new Date();
        const currentHour = currentDate.getHours() % 12 || 12; // 12-hour format
        const currentMinute = currentDate.getMinutes();

        if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
            const newHour = (currentHour === 12) ? 1 : currentHour + 1;
            setSelectedHour(newHour);
            setSelectedMinute(0);
            updateTime(newHour, 0, true);
        }
    }, [selectedHour, selectedMinute, updateTime]);

    const handleHourChange = (e) => {
        setSelectedHour(e.target.value);
        updateTime(e.target.value, selectedMinute, isAm);
    };

    const handleMinuteChange = (e) => {
        setSelectedMinute(e.target.value);
        updateTime(selectedHour, e.target.value, isAm);
    };

    const handleAmPmChange = () => {
        setIsAm(!isAm);
        updateTime(selectedHour, selectedMinute, !isAm);
    };


    return (
        <div className="flex flex-col mb-4">
            <div className="flex items-center space-x-4">
                <select value={selectedHour} onChange={handleHourChange} className="bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300">
                    {hours.map((hour) => (
                        <option key={hour} value={hour}>{hour}</option>
                    ))}
                </select>
                <select value={selectedMinute} onChange={handleMinuteChange} className="bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300">
                    {minutes.map((minute) => (
                        <option key={minute} value={minute}>{minute < 10 ? '0' + minute : minute}</option>
                    ))}
                </select>
                <button onClick={handleAmPmChange} className="bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300">
                    {isAm ? 'AM' : 'PM'}
                </button>
            </div>
        </div>
    );
}

export default TimePicker;