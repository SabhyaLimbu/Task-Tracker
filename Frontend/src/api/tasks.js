const API_URI = "http://localhost:3000/api/tasks";

const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        const errorData = contentType?.includes('application/json') 
            ? await response.json()
            : await response.text();
        throw new Error(
            errorData?.message || 
            errorData?.error || 
            `Request failed with status ${response.status}`
        );
    }
    
    return contentType?.includes('application/json') 
        ? response.json() 
        : response.text();
};

export const FetchTasks = async () => {
    const response = await fetch(API_URI, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });
    return handleResponse(response);
};

export const AddTask = async (task) => {
    const response = await fetch(API_URI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(task),
    });
    return handleResponse(response);
};

export const DeleteTask = async (id) => {
    const response = await fetch(`${API_URI}/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });
    return handleResponse(response);
};

export const UpdateTask = async (id, updates) => {
    const response = await fetch(`${API_URI}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};