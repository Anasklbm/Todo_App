import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup } from 'react-bootstrap';
import { FaTrashAlt, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TodoList.css';

// DraggableItem component for drag-and-drop functionality
const DraggableItem = ({ id, index, moveTask, children }) => {
  const [, ref] = useDrag({
    type: 'TASK',
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return <div ref={(node) => ref(drop(node))}>{children}</div>;
};

// TodoApp component, main application logic
const TodoApp = () => {
  const [inputValues, setInputValues] = useState({
    text: '',
    dueDate: '',
    priority: '',
  });
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('todoItems')) || []);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [checkedItems, setCheckedItems] = useState(() => JSON.parse(localStorage.getItem('checkedItems')) || []);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    // Save items and checkedItems to local storage on every change
    localStorage.setItem('todoItems', JSON.stringify(items));
    localStorage.setItem('checkedItems', JSON.stringify(checkedItems));
  }, [items, checkedItems, showCompleted]);

  // Handle input changes for text, dueDate, and priority
  const handleInputChange = (event, inputType) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [inputType]: event.target.value,
    }));
  };

  // Handle show completed tasks toggle
  const handleShowCompletedChange = () => {
    setShowCompleted(!showCompleted);
  };

  // Handle form submission to add or edit items
  const storeItems = (event) => {
    event.preventDefault();

    if (editingIndex !== -1) {
      // Edit existing item
      const updatedItems = [...items];
      updatedItems[editingIndex] = { ...inputValues };
      const updatedCheckedItems = [...checkedItems];
      setItems(updatedItems);
      setEditingIndex(-1);
    } else {
      // Add new item
      setItems((prevItems) => [...prevItems, { ...inputValues }]);
      setCheckedItems((prevCheckedItems) => [...prevCheckedItems, false]);
      setInputValues({ text: '', dueDate: '', priority: '' });
    }
  };

  // Handle item deletion
  const deleteItem = (index) => {
    const updatedItems = [...items];
    const updatedCheckedItems = [...checkedItems];
    updatedItems.splice(index, 1);
    updatedCheckedItems.splice(index, 1);
    setItems(updatedItems);
    setCheckedItems(updatedCheckedItems);
  };

  // Handle item editing
  const editItem = (index) => {
    const itemToEdit = items[index];
    setInputValues({ ...itemToEdit });
    setEditingIndex(index);
  };

  // Handle checkbox change for item completion
  const handleCheckboxChange = (index) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = !updatedCheckedItems[index];
    setCheckedItems(updatedCheckedItems);
    setInputValues({ text: '', dueDate: '', priority: '' });
  };

  // Handle drag-and-drop for rearranging tasks
  const moveTask = (fromIndex, toIndex) => {
    const updatedItems = [...items];
    const updatedCheckedItems = [...checkedItems];

    const [movedItem] = updatedItems.splice(fromIndex, 1);
    const [movedCheckedItem] = updatedCheckedItems.splice(fromIndex, 1);

    updatedItems.splice(toIndex, 0, movedItem);
    updatedCheckedItems.splice(toIndex, 0, movedCheckedItem);

    setItems(updatedItems);
    setCheckedItems(updatedCheckedItems);
  };

  // Filter items based on showCompleted state
  const filteredItems = items.map((item, index) => ({
    item,
    checked: checkedItems[index],
  })).filter((item) => (showCompleted ? item.checked : true));

  // Render the TodoApp component
  return (
    <DndProvider backend={HTML5Backend}>
      <Container className="todo-container">
        {/* Todo input form */}
        <Form onSubmit={storeItems} className="input-section">
          <h1>Todo App</h1>
          <Form.Control
            type="text"
            placeholder="Enter items"
            onChange={(event) => handleInputChange(event, 'text')}
            value={inputValues.text}
            required
          />
          <Form.Control
            type="date"
            placeholder="Due Date"
            onChange={(event) => handleInputChange(event, 'dueDate')}
            value={inputValues.dueDate}
            required
          />
          <Form.Control
            type="text"
            placeholder="Priority"
            onChange={(event) => handleInputChange(event, 'priority')}
            value={inputValues.priority}
            required
          />
          <Button type="submit" variant="light" className="mt-2 btn-outline-dark">
            {editingIndex !== -1 ? 'Edit Item' : 'Add Item'}
          </Button>
        </Form>

        {/* Todo items list */}
        <ListGroup className="mt-4">
          {/* Checkbox to show completed tasks */}
          <Form.Check
            type="checkbox"
            label={<span style={{ color: 'gray' }}>Show Completed</span>}
            onChange={handleShowCompletedChange}
            className="mt-2 mb-2"
          />

          {/* Map and render filtered items with drag-and-drop functionality */}
          {filteredItems.map(({ item, checked }, index) => (
            <DraggableItem key={index} id={index} index={index} moveTask={moveTask}>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  {/* Checkbox for task completion */}
                  <input
                    type="checkbox"
                    id={`checkbox-${index}`}
                    className="me-2"
                    checked={checked}
                    onChange={() => handleCheckboxChange(index)}
                  />
                  {/* Display check or times icon based on task completion */}
                  {checked ? (
                    <FaCheck className="text-success me-2" />
                  ) : (
                    <FaTimes className="text-danger me-2" />
                  )}
                  <div>
                    {/* Task text */}
                    <div className='text-center'>{item.text}</div>
                    {/* Display due date and priority if available */}
                    {item.dueDate && <small className="text-muted me-2">Due Date: {item.dueDate}</small>}
                    {item.priority && <small className="text-muted">Priority: {item.priority}</small>}
                  </div>
                </div>

                {/* Actions: Delete and Edit icons */}
                <div className="d-flex">
                  <FaTrashAlt
                    className="mr-4 me-2 text-dark"
                    onClick={() => deleteItem(index)}
                  />
                  <FaEdit
                    className="ml-4 text-dark"
                    onClick={() => editItem(index)}
                  />
                </div>
              </ListGroup.Item>
            </DraggableItem>
          ))}
        </ListGroup>
      </Container>
    </DndProvider>
  );
};

export default TodoApp;
