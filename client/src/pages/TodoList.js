import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getAllTodos, createTodo, updateTodo, deleteTodo } from '../services/api';
import '../styles/pageWrapper.css';
import './TodoList.css';

function TodoList() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  
  const [tasks, setTasks] = useState({
    upcoming: [],
    ongoing: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Load tasks from API
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getAllTodos();
      
      // Group tasks by status
      const grouped = {
        upcoming: data.filter(task => task.status === 'upcoming'),
        ongoing: data.filter(task => task.status === 'ongoing'),
        completed: data.filter(task => task.status === 'completed')
      };
      
      setTasks(grouped);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks by current month
  const filterTasksByMonth = (taskList) => {
    return taskList.filter(task => {
      const taskDate = new Date(task.created_at);
      return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
    });
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const normalizeDateInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d)) return '';
    return d.toISOString().slice(0, 10);
  };

  const formatDisplayDate = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, day] = value.split('-').map(Number);
      const utc = new Date(Date.UTC(y, m - 1, day));
      return utc.toLocaleDateString('id-ID');
    }
    const d = new Date(value);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('id-ID');
  };

  const monthOptions = useMemo(() => (
    Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(2000, i).toLocaleString('default', { month: 'long' })
    }))
  ), []);

  const yearOptions = useMemo(() => {
    const all = [...(tasks.upcoming || []), ...(tasks.ongoing || []), ...(tasks.completed || [])];
    const years = new Set(all.map(t => new Date(t.created_at).getFullYear()).filter(Boolean));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [tasks]);

  const DraggableCard = React.memo(function DraggableCard({ task, index, onDelete, isHidden }) {
    const taskId = String(task.id);
    return (
      <Draggable key={taskId} draggableId={taskId} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`task-card ${snapshot.isDragging ? 'dragging' : ''} ${isHidden ? 'hidden-task' : ''}`}
          >
            <div className="task-header">
              <h4>{task.title}</h4>
              <button
                className="delete-task-btn"
                onClick={() => onDelete(task.id)}
              >
                🗑️
              </button>
            </div>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
            {task.due_date && (
              <div className="task-due-date">
                📅 {formatDisplayDate(task.due_date)}
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  });

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      console.log('Same position');
      return;
    }

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const sourceItems = Array.from(sourceColumn);
    const destItems = source.droppableId === destination.droppableId ? sourceItems : Array.from(destColumn);

    // Find removed item by id to avoid index mismatch
    const draggableId = result.draggableId;
    const srcIdx = sourceItems.findIndex(t => String(t.id) === String(draggableId));
    if (srcIdx === -1) return;
    const [removed] = sourceItems.splice(srcIdx, 1);

    // Add to destination
    destItems.splice(destination.index, 0, removed);

    // Update local state immediately for smooth UX
    setTasks(prev => ({
      ...prev,
      [source.droppableId]: sourceItems,
      [destination.droppableId]: destItems
    }));

    // Update in database
    try {
      await updateTodo(removed.id, {
        title: removed.title,
        description: removed.description,
        due_date: removed.due_date,
        status: destination.droppableId
      });
      showNotification('✅ Task moved successfully!', 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      showNotification('❌ Failed to move task. Reverting...', 'error');
      // Revert on error
      loadTasks();
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        due_date: normalizeDateInput(newTask.dueDate) || null,
        status: 'upcoming'
      };

      await createTodo(taskData);
      await loadTasks(); // Reload tasks from server

      setNewTask({ title: '', description: '', dueDate: '' });
      setShowAddModal(false);
      showNotification('✅ Task created successfully!', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showNotification('❌ Failed to create task. Please try again.', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleDeleteTask = async (columnId, taskId) => {
    try {
      await deleteTodo(taskId);
      await loadTasks(); // Reload tasks from server
      showNotification('✅ Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showNotification('❌ Failed to delete task. Please try again.', 'error');
    }
  };

  const columns = [
    { id: 'upcoming', title: '📋 Upcoming', color: 'var(--primary-light)' },
    { id: 'ongoing', title: '⚡ Ongoing', color: 'var(--primary)' },
    { id: 'completed', title: '✅ Completed', color: 'var(--primary-dark)' }
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-main">
        <div className="todo-header">
          <div className="todo-title-section">
            <h1>📝 Todo List</h1>
            <p className="todo-subtitle">Organize your tasks with drag & drop</p>
          </div>
          <div className="todo-controls">
            <div className="month-display">
              📅 {monthName}
            </div>
            <div className="month-picker">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
              >
                {monthOptions.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button className="add-task-button" onClick={() => setShowAddModal(true)}>
              ➕ Add Task
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading tasks...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="kanban-board">
              {columns.map(column => {
              const fullTasks = tasks[column.id];
              const visibleCount = filterTasksByMonth(fullTasks).length;
              const handleDelete = (taskId) => handleDeleteTask(column.id, taskId);
              return (
                <div key={column.id} className="kanban-column">
                  <div className="column-header" style={{ borderColor: column.color }}>
                    <h3>{column.title}</h3>
                    <span className="task-count">{visibleCount}</span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      >
                        {fullTasks.map((task, index) => {
                          const taskDate = new Date(task.created_at);
                          const isVisible = taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
                          return (
                            <DraggableCard
                              key={String(task.id)}
                              task={task}
                              index={index}
                              onDelete={handleDelete}
                              isHidden={!isVisible}
                            />
                          );
                        })}
                        {provided.placeholder}
                        {visibleCount === 0 && (
                          <div className="empty-column">
                            <p>No tasks yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
            </div>
          </DragDropContext>
        )}

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="add-task-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>➕ Add New Task</h2>
                <button className="close-button" onClick={() => setShowAddModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleAddTask} className="task-form">
                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description..."
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={normalizeDateInput(newTask.dueDate)}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: normalizeDateInput(e.target.value) })}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div className={`notification-toast ${notification.type}`}>
            <span>{notification.message}</span>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default TodoList;
