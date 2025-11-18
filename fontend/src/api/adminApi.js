import axios from 'axios';

const LOCAL_API = process.env.BACKEND_API || 'http://localhost:3000/api';

export const ConfigApi = {
    async get(empCode, month, year) {
        const response = await fetch(`${LOCAL_API}/attendance/record/${empCode}/${month}/${year}`, );
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    },
};