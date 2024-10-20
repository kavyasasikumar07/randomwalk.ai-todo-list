import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Modal Component for alerts
const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

// Task Component
const Task = ({ task, index, completeTask, removeTask }) => {
  const isOverdue = new Date() > new Date(task.dueTime) && !task.completed;
  const taskStyle = isOverdue && !task.acknowledged ? { color: 'red' } : task.completed ? { color: 'green' } : { color: '#f9f9f9' };

  return (
    <div className="task" style={{ textDecoration: task.completed ? "line-through" : "" }}>
      <div className="task-details">
        <input 
          type="checkbox" 
          className={`checkbox ${task.completed ? 'checked' : ''}`} 
          checked={task.completed}
          onChange={() => completeTask(index)} 
        />
        <span style={taskStyle}>{task.title}</span>
      </div>
      <div className="task-time">{task.dueTime}</div>
      <button onClick={() => removeTask(index)} className="delete-btn">Delete</button>
    </div>
  );
};

// Task Form Component
const TaskForm = ({ addTask }) => {
  const [value, setValue] = useState("");
  const [dueTime, setDueTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value || !dueTime) return;
    addTask(value, dueTime);
    setValue("");
    setDueTime("");
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        className="task-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a new task"
      />
      <input
        type="datetime-local"
        className="time-input"
        value={dueTime}
        onChange={(e) => setDueTime(e.target.value)}
      />
      <button type="submit" className="add-button">+</button>
    </form>
  );
};

// Main App Component
const App = () => {
  const [tasks, setTasks] = useState([
    { title: "Buy water", completed: false, dueTime: "2024-10-20T12:00", acknowledged: false },
    { title: "Remove torrent and install transmission", completed: false, dueTime: "2024-10-20T15:00", acknowledged: false },
    { title: "Update kernel to latest version", completed: false, dueTime: "2024-10-20T17:00", acknowledged: false }
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modal, setModal] = useState(null);

  // Memoize acknowledgeTask to avoid the ESLint warning
  const acknowledgeTask = useCallback((index) => {
    const newTasks = [...tasks];
    newTasks[index].acknowledged = true;
    setTasks(newTasks);
  }, [tasks]);

  const addTask = (title, dueTime) => {
    const newTasks = [...tasks, { title, completed: false, dueTime, acknowledged: false }];
    setTasks(newTasks);
  };

  const completeTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = true;
    setTasks(newTasks);
  };

  const removeTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  // Real-Time Clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Task Reminder Alerts with Modal
  useEffect(() => {
    tasks.forEach((task, index) => {
      if (!task.completed && new Date() >= new Date(task.dueTime) && !task.acknowledged) {
        setModal({
          message: `Reminder: Task "${task.title}" is overdue!`,
          onClose: () => {
            acknowledgeTask(index);
            setModal(null);
          }
        });
      }
    });
  }, [currentTime, tasks, acknowledgeTask]);

  // Get today's date in readable format
  const getToday = () => {
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <div className="app">
      {modal && <Modal message={modal.message} onClose={modal.onClose} />}
      <div className="todo-container">
        <h1 className="todo-heading">Todo</h1>
        <div className="date-time">
          <div>{getToday()}</div>
          <div>{currentTime.toLocaleTimeString()}</div>
        </div>
        {tasks.map((task, index) => (
          <Task key={index} index={index} task={task} completeTask={completeTask} removeTask={removeTask} />
        ))}
        <TaskForm addTask={addTask} />
      </div>
    </div>
  );
};

export default App;
