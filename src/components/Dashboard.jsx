import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import Modal from 'react-modal';
import api from "../utils/api"

Modal.setAppElement('#root');

const Dashboard = () => {
  const [state, setState] = useState({
    tasks: { todo: [], inProgress: [], done: [] },
    taskName: '',
    description: '',
    searchTerm: '',
    sortOption: '',
    modalIsOpen: false,
    isEditMode: false,
    editTaskId: null,
    viewDetailsModalIsOpen: false,
    viewTask: null,
  });


  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
        const response = await api.get('/getTodo');
        const data = response.data.data; // Access the nested `data` field
        setState(prevState => ({
            ...prevState,
            tasks: {
                todo: data.filter(task => task.status === 'todo'),
                inProgress: data.filter(task => task.status === 'inProgress'),
                done: data.filter(task => task.status === 'done'),
            }
        }));
    } catch (error) { 
        console.error('Failed to fetch tasks:', error); 
    }
};
  const handleSaveTask = async () => {
    const { taskName, description, isEditMode, editTaskId} = state;
    if (!taskName || !description) return toast.error('Please fill in all fields');
    const newTask = { title: taskName, description, status: 'todo', createdAt: new Date().toISOString() };
    try {
      if (isEditMode) {
        await api.put(`/updateTodo/${editTaskId}`, newTask);
      } else {
        await api.post('/createTodo', newTask);
      }
      fetchTasks();
      setState(prevState => ({
        ...prevState,
        taskName: '',
        description: '',
        modalIsOpen: false,
        isEditMode: false,
        editTaskId: null,
      }));
      toast.success(isEditMode ? 'Task updated!' : 'Task added!');
    } catch (error) { toast.error('Failed to save task.'); console.error('Failed to save task:', error); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/deleteTodo/${taskId}`);
      fetchTasks();
      toast.success('Task deleted!');
    } catch (error) { toast.error('Failed to delete task.'); console.error('Failed to delete task:', error); }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return; // Drop outside the list
  
    const { source, destination } = result;
    const sourceColumn = [...state.tasks[source.droppableId]];
    const destColumn = [...state.tasks[destination.droppableId]];
  
    // Moving the task
    const [removed] = sourceColumn.splice(source.index, 1);
    removed.status = destination.droppableId; // Update task status
    destColumn.splice(destination.index, 0, removed);
  
    // Update state
    setState(prevState => ({
      ...prevState,
      tasks: {
        ...prevState.tasks,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      }
    }));
  
    // Update task status in backend
    try {
      await api.put(`/updateTodoStatus/${removed._id}`, { status: removed.status });
      toast.success('Task status updated!');
    } catch (error) {
      toast.error('Failed to update task status.');
      console.error('Failed to update task status:', error);
    }
  };
  
  const filteredTasks = (columnTasks) => columnTasks
  .filter(task => {
    const title = task.title || ''; // Provide default value
    const description = task.description || ''; // Provide default value
    return title.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
           description.toLowerCase().includes(state.searchTerm.toLowerCase());
  })
  .sort((a, b) => {
    if (state.sortOption === 'title') return (a.title || '').localeCompare(b.title || '');
    if (state.sortOption === 'date') return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  const handleInputChange = (e) => setState(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  const openModalForEdit = (task) => {
    setState(prevState => ({
      ...prevState,
      taskName: task.title,
      description: task.description,
      isEditMode: true,
      editTaskId: task._id,
      modalIsOpen: true,
    }));
  };

  const handleViewDetails = (task) => {
  setState(prevState => ({
    ...prevState,
    viewTask: task,
    viewDetailsModalIsOpen: true,
  }));
};


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4">
        <input 
          type="text" 
          name="searchTerm" 
          placeholder="Search" 
          value={state.searchTerm} 
          onChange={handleInputChange} 
          className="border p-2 mr-2 rounded-lg" 
        />
        <select 
          name="sortOption" 
          value={state.sortOption} 
          onChange={handleInputChange} 
          className="border p-2 mr-2 rounded-lg"
        >
          <option value="">Sort By</option>
          <option value="title">Title</option>
          <option value="date">Date</option>
        </select>
        <button onClick={() => setState(prevState => ({ ...prevState, modalIsOpen: true }))} className="bg-blue-500 text-white px-4 py-2 mt-3 md:mt-0 rounded-md">
          Add Task
        </button>
      </div>
      <Modal
        isOpen={state.modalIsOpen}
        onRequestClose={() => setState(prevState => ({ ...prevState, modalIsOpen: false }))}
        overlayClassName="modal-overlay"
        className="modal-content"
      >
        <div className="flex flex-col items-center p-4 relative">
          {/* Close Button */}
          <button
            onClick={() => setState(prevState => ({ ...prevState, modalIsOpen: false }))}
            className="modal-close-button"
          >
            X
          </button>
          <h2 className="text-xl font-bold mb-4">
            {state.isEditMode ? 'Edit Task' : 'Add Task'}
          </h2>
          <input
            type="text"
            name="taskName"
            placeholder="Task Name"
            value={state.taskName}
            onChange={handleInputChange}
            className="border p-2 mb-4"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={state.description}
            onChange={handleInputChange}
            className="border p-2 mb-4"
          />
          <button onClick={handleSaveTask} className="bg-green-500 text-white px-4 py-2">
            {state.isEditMode ? 'Update Task' : 'Save Task'}
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={state.viewDetailsModalIsOpen} 
        onRequestClose={() => setState(prevState => ({ ...prevState, viewDetailsModalIsOpen: false }))} 
        overlayClassName="modal-overlay"
        className="modal-content"
      >
        <div className="flex flex-col items-center p-4">
          <h2 className="text-xl font-bold mb-4">Task Details</h2>
          {state.viewTask ? (
            <>
              <h3 className="text-lg font-bold">{state.viewTask.title}</h3>
              <p>{state.viewTask.description}</p>
              <p className="text-sm text-gray-500">
                Created at: {new Date(state.viewTask.createdAt).toLocaleString()}
              </p>
            </>
          ) : (
            <p>Loading...</p>
          )}
          <button 
            onClick={() => setState(prevState => ({ ...prevState, viewDetailsModalIsOpen: false }))} 
            className="bg-blue-500 text-white px-4 py-2 mt-4"
          >
            Close
          </button>
        </div>
      </Modal>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['todo', 'inProgress', 'done'].map(columnId => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className="p-4 border rounded bg-gray-100"
                >
                  <h2 className="text-xl font-bold mb-4">
                    {columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                  </h2>
                  {filteredTasks(state.tasks[columnId]).map((task, index) => (
                    <Draggable 
                      key={task._id} 
                      draggableId={task._id} 
                      index={index}
                    >
                      {(provided) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.draggableProps} 
                          {...provided.dragHandleProps} 
                          className="bg-white p-4 mb-4 rounded shadow-lg shadow-royalblue-700"
                        >
                          <h3 className="text-lg font-bold">{task.title}</h3>
                          <p>{task.description}</p>
                          <p className="text-sm text-gray-500">
                            Created at: {new Date(task.createdAt).toLocaleString()}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button 
                                className="bg-blue-500 text-white lg:px-2 lg:py-1 px-2 py-1 md:px-1 rounded"
                                onClick={() => handleViewDetails(task)}
                              >
                              View Details
                            </button>
                            <button 
                              className="bg-yellow-500 text-white lg:px-2 lg:py-1 px-2 py-1 md:px-1 rounded"
                              onClick={() => openModalForEdit(task)}
                            >
                              Edit
                            </button>
                            <button 
                              className="bg-red-500 text-white lg:px-2 lg:py-1 px-2 py-1 md:px-1 rounded"
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>


    </div>
  );
};

export default Dashboard;

