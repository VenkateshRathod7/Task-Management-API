const Task = require('../models/Task');
const Joi = require('joi');

// Validation Schema
const taskSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'COMPLETED').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').required(),
  dueDate: Joi.date().optional(),
});

// Create a Task
exports.createTask = async (req, res, next) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const task = await Task.create(value);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// Get All Tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, sort, limit = 10, skip = 0 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    }

    const tasks = await Task.find(query).sort(sortOptions).limit(Number(limit)).skip(Number(skip));
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// Get a Task by ID
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// Update a Task
exports.updateTask = async (req, res, next) => {
  try {
    const { error, value } = taskSchema.validate(req.body, { allowUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    value.updatedAt = new Date();

    const task = await Task.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// Delete a Task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
