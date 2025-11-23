import axios from 'axios';

const getMe = async () => {
    try {
        const response = await axios.get('/api/user/me', {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        return null;
    }
};

export { getMe };
