import axios from 'axios';
import { getCookie } from "../utils/cookiesUtil";
const LOCAL_API = process.env.BACKEND_API || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = getCookie("accessToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};
export const LeaveAPI = {
    async getLeaveList() {
        const response = await fetch(`${LOCAL_API}/leave/leave-list`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    },

    async applyLeaves(data) {
        try {
            const response = await axios.post(`${LOCAL_API}/leave/apply`, data, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error(
                "Error fetching employees by role:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    async updateLeaveStatus({ id, status }) {
        try {
            const response = await axios.patch(
                `${LOCAL_API}/leave`,
                {
                    headers: getAuthHeaders(),
                    params: { id, status },
                }
            );

            return response.data;
        } catch (error) {
            console.error(
                "Error updating leave status:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    async deleteLeave(id) {
        try {
            const response = await axios.delete(`${LOCAL_API}/leave/delete/${id}`, {
                headers: {
                    ...getAuthHeaders(),  // Authorization: Bearer token
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error(
                "Error deleting leave:",
                error.response?.data || error.message
            );
            throw error;
        }
    }




    // async getAttendanceByEmployee(empCode, month, year) {
    //     const response = await fetch(`${LOCAL_API}/attendance/record/${empCode}/${month}/${year}`, {
    //         headers: getAuthHeaders(),
    //     });
    //     if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //     }
    //     return response.json();
    // },
};