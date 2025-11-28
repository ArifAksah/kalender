import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getTodos, addTodo, updateTodo, deleteTodo } from '../services/todoService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icons';

function TodoList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({ upcoming: [], ongoing: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0] });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadTasks = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await getTodos(user.id);
      setTasks({
        upcoming: data.filter(t => t.status === 'upcoming' || t.status === 'pending'),
        ongoing: data.filter(t => t.status === 'ongoing'),
        completed: data.filter(t => t.status === 'completed')
      });
    } catch (err) {
      console.error('Error loading tasks:', err);
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    const srcItems = [...tasks[source.droppableId]];
    const destItems = source.droppableId === destination.droppableId ? srcItems : [...tasks[destination.droppableId]];
    const [moved] = srcItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, moved);

    setTasks(prev => ({ ...prev, [source.droppableId]: srcItems, [destination.droppableId]: destItems }));

    const result2 = await updateTodo(moved.id, { status: destination.droppableId });
    if (result2.success) {
      showToast('Task moved');
    } else {
      showToast('Failed to move task', 'error');
      loadTasks();
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }
    if (!user?.id) {
      showToast('Please login first', 'error');
      return;
    }

    setSaving(true);
    const result = await addTodo(user.id, { 
      title: newTask.title, 
      description: newTask.description, 
      due_date: newTask.dueDate || null, 
      status: 'upcoming' 
    });
    
    if (result.success) {
      setTasks(prev => ({
        ...prev,
        upcoming: [result.data, ...prev.upcoming]
      }));
      setNewTask({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0] });
      setShowModal(false);
      showToast('Task created');
    } else {
      showToast(result.error || 'Failed to create task', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id, status) => {
    if (!window.confirm('Delete this task?')) return;
    
    const result = await deleteTodo(id);
    if (result.success) {
      setTasks(prev => ({
        ...prev,
        [status]: prev[status].filter(t => t.id !== id)
      }));
      showToast('Task deleted');
    } else {
      showToast(result.error || 'Failed to delete task', 'error');
    }
  };

  const columns = [
    { id: 'upcoming', title: 'Upcoming', color: 'bg-blue-100 text-blue-700' },
    { id: 'ongoing', title: 'In Progress', color: 'bg-amber-100 text-amber-700' },
    { id: 'completed', title: 'Completed', color: 'bg-emerald-100 text-emerald-700' }
  ];

  if (loading) return <LoadingSpinner message="Loading tasks..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Tasks</h1>
          <p className="text-blue-600 text-sm mt-1">Drag and drop to organize</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Icon name="plus" className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col">
              <div className={`px-4 py-3 rounded-t-xl ${col.color} flex items-center justify-between`}>
                <h3 className="font-semibold text-sm">{col.title}</h3>
                <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-medium">{tasks[col.id].length}</span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 rounded-b-xl bg-white/50 min-h-[400px] space-y-3 border border-t-0 border-blue-100 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                  >
                    {tasks[col.id].map((task, index) => (
                      <Draggable key={String(task.id)} draggableId={String(task.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white border border-blue-100 rounded-lg p-3 shadow-sm ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-300' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-blue-900 text-sm">{task.title}</h4>
                              <button 
                                onClick={() => handleDelete(task.id, col.id)} 
                                className="text-blue-300 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                              >
                                <Icon name="trash" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {task.description && <p className="text-xs text-blue-500 line-clamp-2 mb-2">{task.description}</p>}
                            {task.due_date && (
                              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit flex items-center gap-1">
                                <Icon name="calendar" className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {tasks[col.id].length === 0 && <p className="text-center text-blue-400 text-sm py-8">No tasks</p>}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <Icon name="plus" className="w-5 h-5 text-blue-500" />
                Add Task
              </h2>
              <button onClick={() => setShowModal(false)} className="text-blue-400 hover:text-blue-600 p-1 hover:bg-blue-100 rounded-lg transition-colors">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-blue-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="3"
                  className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-700 mb-1 flex items-center gap-1">
                  <Icon name="calendar" className="w-4 h-4" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1" disabled={saving}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Saving...' : <><Icon name="plus" className="w-4 h-4" /> Add</>}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg text-sm z-50 shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          <Icon name={toast.type === 'success' ? 'checkCircle' : 'x'} className="w-4 h-4" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default TodoList;
