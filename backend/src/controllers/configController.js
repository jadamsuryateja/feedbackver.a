import Config from '../models/Config.js';

const validateConfigTitle = (title, isBSH = false) => {
  if (isBSH) {
    // Format for BSH: BRANCH-BSH-SECTION-SEMESTER-YEAR
    return /^[A-Z]+-BSH-[A-Z]-[1-2]-[1-4]$/.test(title);
  }
  // Regular format: BRANCH-SECTION-SEMESTER-YEAR
  return /^[A-Z]+-[A-Z]-[1-2]-[1-4]$/.test(title);
};

export const createConfig = async (req, res) => {
  try {
    // Validate request body
    const { 
      title, 
      branch,
      academicYear, 
      year, 
      semester, 
      section, 
      theorySubjects, 
      labSubjects 
    } = req.body;

    // Check required fields
    if (!title || !branch || !academicYear || !year || !semester || !section) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'All fields are required: title, branch, academicYear, year, semester, section'
      });
    }

    const upperTitle = title.toUpperCase();

    // Validate year and semester
    if (year < 1 || year > 4 || semester < 1 || semester > 2) {
      return res.status(400).json({
        error: 'Invalid year or semester',
        message: 'Year must be between 1-4 and semester must be 1-2'
      });
    }

    // Check for existing config
    const existingConfig = await Config.findOne({ title: upperTitle });
    if (existingConfig) {
      return res.status(409).json({ 
        error: 'Duplicate title',
        message: 'Configuration with this title already exists'
      });
    }

    // Create new config
    const config = new Config({
      title: upperTitle,
      branch,
      academicYear,
      year: parseInt(year),
      semester: parseInt(semester),
      section: section.toUpperCase(),
      theorySubjects: theorySubjects || [],
      labSubjects: labSubjects || []
    });

    const savedConfig = await config.save();
    res.status(201).json(savedConfig);

  } catch (error) {
    console.error('Create config error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: Object.values(error.errors).map(err => err.message)
      });
    }

    // Handle other errors
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create configuration'
    });
  }
};

export const getConfigs = async (req, res) => {
  try {
    const { branch, year, semester, academicYear } = req.query;
    
    // Build query object
    const query = {};
    
    // Add role-based restrictions
    if (req.user.role === 'coordinator') {
      query.branch = req.user.branch;
    } else if (req.user.role === 'bsh') {
      query.branch = { $regex: '-BSH$' };
    }

    // Add filters if provided
    if (branch) query.branch = branch;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (academicYear) query.academicYear = academicYear;

    console.log('Query:', query); // Debug log

    const configs = await Config.find(query).sort({ createdAt: -1 });
    
    console.log('Found configs:', configs.length); // Debug log
    
    res.json(configs);

  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch configurations'
    });
  }
};

export const getConfigByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    const config = await Config.findOne({ title });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...updateData } = req.body;

    const config = await Config.findById(id);
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Only check for duplicate titles when title is being changed
    if (title && title !== config.title) {
      const existingConfig = await Config.findOne({ 
        title: title.toUpperCase(),
        _id: { $ne: id } // Exclude current config
      });
      
      if (existingConfig) {
        return res.status(409).json({ 
          error: 'Configuration with this title already exists' 
        });
      }
    }

    // Update config
    config.title = title ? title.toUpperCase() : config.title;
    Object.assign(config, updateData);
    config.updatedAt = Date.now();

    await config.save();
    res.json({ message: 'Configuration updated successfully', config });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteConfig = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete configurations' });
    }

    const config = await Config.findByIdAndDelete(id);

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Delete config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
