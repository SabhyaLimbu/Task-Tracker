import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const TaskItem = ({ task, onDelete, onEdit, onToggle }) => {
    return (
        <div className="task-item flex items-center justify-between p-3 bg-white rounded-lg shadow mb-2">
            <div className="flex items-center space-x-3 flex-grow">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task._id, { completed: !task.completed })}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span 
                    className={`flex-grow ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                >
                    {task.title}
                </span>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => onEdit(task._id)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                    aria-label="Edit task"
                >
                    <FaEdit />
                </button>
                <button
                    onClick={() => onDelete(task._id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                    aria-label="Delete task"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default TaskItem;