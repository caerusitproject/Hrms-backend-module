
import axios from 'axios'; import { getCookie } from "../utils/cookiesUtil";
const LOCAL_API = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = getCookie("accessToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};
export const AttendanceAPI = {
    async getAttendanceByEmployee(empCode, month, year) {
        const response = await fetch(`${LOCAL_API}/attendance/record/${empCode}/${month}/${year}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    },
};