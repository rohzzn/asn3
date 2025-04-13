// Global state
const state = {
  data: [],
  year: 2022,
  selectedQuarter: 0, // 0 = Q1, 1 = Q2, 2 = Q3, 3 = Q4
  yearRange: { min: 2022, max: 2024 }
};

// Category colors - refined color palette for better cohesion
const categoryColors = {
  'Meeting': '#F5A623',       // Warm orange
  'Chat features': '#4A90E2',  // Bright blue
  'Contact Center features': '#5E7F9A', // Steel blue
  'General features': '#63A375', // Forest green
  'Mail and Calendar features': '#7B68EE', // Medium slate blue
  'Phone features': '#607D8B', // Blue grey
  'Team Chat features': '#3F51B5', // Indigo
  'Webinar features': '#8BC34A', // Light green
  'Whiteboard features': '#00BCD4', // Cyan
  'Zoom Apps features': '#009688', // Teal
  'Zoom Clips': '#9C27B0',    // Purple
  'Zoom Clips features': '#673AB7', // Deep purple
  'Zoom Mail and Calendar': '#2196F3', // Blue
  'Uncategorized': '#78909C'  // Blue Grey Light
};

// Add this after the categoryColors definition
const heatmapColors = {
  blue: {
    min: '#E3F2FD',
    max: '#0E71EB'
  },
  green: {
    min: '#E8F5E9',
    max: '#2E7D32'
  },
  purple: {
    min: '#F3E5F5',
    max: '#7B1FA2'
  },
  rainbow: {
    min: '#FFEBEE',
    max: '#1A237E'
  }
};

// Normalized category colors for case-insensitive matching
const normalizedCategoryColors = {};

// DOM elements
const elements = {
  loadingOverlay: document.getElementById('loadingOverlay'),
  
  // Calendar controls
  prevQuarterBtn: document.getElementById('prevQuarterBtn'),
  nextQuarterBtn: document.getElementById('nextQuarterBtn'),
  quarterLabel: document.getElementById('quarterLabel'),
  heatmapColor: document.getElementById('heatmapColor'),
  colorValue: document.getElementById('colorValue'),
  
  // Calendar view
  calendarContainer: document.getElementById('calendarContainer'),
  quarterlyCalendar: document.getElementById('quarterlyCalendar'),
  dayDetails: document.getElementById('dayDetails'),
  
  // Quarterly statistics
  totalFeaturesValue: document.getElementById('totalFeaturesValue'),
  quarterlyStatsChart: document.getElementById('quarterlyStatsChart'),
  quarterNumber: document.getElementById('quarterNumber'),
  yearNumber: document.getElementById('yearNumber')
};

// Month names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const shortMonthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Date range constraint
const DATE_RANGE = {
  start: new Date(2022, 0, 1), // Jan 1, 2022
  end: new Date(2024, 0, 31)   // Jan 31, 2024
};

// Initialize the application
async function init() {
  try {
    // Show loading overlay
    if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.remove('hidden');
    }
    
    // Initialize normalized colors
    initializeNormalizedColors();
    
    // Try to load Excel data first
    try {
    await loadData();
      console.log('Excel data loaded successfully:', state.data.length, 'items');
    } catch (dataError) {
      console.warn('Failed to load Excel data:', dataError);
      console.log('Falling back to sample data generation');
      generateSampleData();
    }
    
    // Verify we have data
    if (!state.data || state.data.length === 0) {
      throw new Error('No data available after initialization');
    }
    
    console.log('Data initialized with', state.data.length, 'items');
    
    // Determine year range from data
    determineYearRange();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update quarter label
    updateQuarterLabel();
    
    // Initial render
    if (elements.calendarContainer) {
      renderQuarterlyCalendar();
    } else {
      throw new Error('Calendar container not found');
    }
    
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize the application. Please refresh the page and try again.');
  } finally {
    // Always hide loading overlay
    if (elements.loadingOverlay) {
      elements.loadingOverlay.classList.add('hidden');
    }
  }
}

// Initialize normalized colors
function initializeNormalizedColors() {
  // Create normalized map for case-insensitive matching
  Object.keys(categoryColors).forEach(category => {
    normalizedCategoryColors[normalizeText(category)] = categoryColors[category];
  });
}

// Normalize text for consistent matching
function normalizeText(text) {
  if (!text) return '';
  return text.trim().toLowerCase();
}

// Get color for a category with normalization
function getCategoryColor(category) {
  if (!category) return '#78909C'; // Default color
  
  // Try direct match first
  if (categoryColors[category]) {
    return categoryColors[category];
  }
  
  // Try normalized match
  const normalizedKey = normalizeText(category);
  return normalizedCategoryColors[normalizedKey] || '#78909C';
}

// Determine year range from data
function determineYearRange() {
  if (state.data.length === 0) {
    state.yearRange = { min: 2022, max: 2024 }; // Default range
    return;
  }
  
  const years = state.data.map(item => item.year);
  state.yearRange = {
    min: Math.min(...years),
    max: Math.max(...years)
  };
  
  console.log(`Determined year range: ${state.yearRange.min} to ${state.yearRange.max}`);
}

// Generate sample data for testing
function generateSampleData() {
  const categories = [
    'Meeting', 'Chat features', 'Contact Center features',
    'General features', 'Mail and Calendar features', 'Phone features',
    'Team Chat features', 'Webinar features', 'Whiteboard features'
  ];
  
  const teams = [
    'Frontend', 'Backend', 'Mobile', 'Security', 'Infrastructure',
    'Design', 'API', 'QA', 'DevOps'
  ];
  
  const impacts = ['High', 'Medium', 'Low'];
  const complexities = ['High', 'Medium', 'Low'];
  
  // Generate features for 2022-2024
  for (let year = 2022; year <= 2024; year++) {
    for (let month = 0; month < 12; month++) {
      // Skip months after current date
      if (year === 2024 && month > 0) continue;
      
      // Generate 2-5 features per month
      const numFeatures = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < numFeatures; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const team = teams[Math.floor(Math.random() * teams.length)];
        
        state.data.push({
          date: new Date(year, month, day),
          year: year,
          month: month,
          day: day,
          category: category,
          team: team,
          description: `Sample ${category} feature ${i + 1}`,
          impact: impacts[Math.floor(Math.random() * impacts.length)],
          complexity: complexities[Math.floor(Math.random() * complexities.length)],
          timeToRelease: Math.floor(Math.random() * 30) + 5,
          bugCount: Math.floor(Math.random() * 5),
          dependencies: teams.slice(0, Math.floor(Math.random() * 3) + 1)
        });
      }
    }
  }
  
  // Sort data by date
  state.data.sort((a, b) => a.date - b.date);
}

// Load Excel data
async function loadData() {
  try {
    console.log('Starting data load...');
    
    // Load Zoom data
    const response = await fetch('data/Zoom.xlsx');
    if (!response.ok) {
      throw new Error(`Failed to fetch Zoom.xlsx: ${response.status} ${response.statusText}`);
    }
    
    console.log('Excel file fetched successfully');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    
    // Check if XLSX is available
    if (typeof XLSX === 'undefined') {
      throw new Error('XLSX library not loaded');
    }
    
    console.log('Reading Excel file...');
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    
    const firstSheetName = workbook.SheetNames[0];
    console.log('Processing sheet:', firstSheetName);
    
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (!jsonData || jsonData.length === 0) {
      throw new Error('No data found in Excel file');
    }
    
    console.log('Raw data loaded:', jsonData.length, 'rows');
    state.data = processReleaseData(jsonData);
    console.log('Data processed successfully:', state.data.length, 'items');
    
    // Log sample of processed data
    if (state.data.length > 0) {
      console.log('Sample data item:', state.data[0]);
    }
    
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Process release data from Excel
function processReleaseData(data) {
  if (!Array.isArray(data)) {
    console.error('Invalid data format:', data);
    return [];
  }
  
  console.log('Processing release data...');
  
  // Process and normalize categories
  const processedData = data.map(item => {
    try {
      // Log raw item for debugging
      console.log('Processing item:', item);
      
    const releaseDate = new Date(item["Release Date"]);
      if (isNaN(releaseDate.getTime())) {
        console.warn('Invalid date:', item["Release Date"]);
        return null;
      }
    
    // Extract and normalize category
    let category = (item["Group / Category"] || "Uncategorized").trim();
    
    // Merge similar categories (optional)
    if (category.toLowerCase().includes('meeting')) {
        category = 'Meeting';
    }
    
      const processedItem = {
      date: releaseDate,
      year: releaseDate.getFullYear(),
      month: releaseDate.getMonth(),
      day: releaseDate.getDate(),
        description: item["Feature Description"] || 'No description available',
      category: category,
      impact: getImpactLevel(item["Feature Description"]),
      team: getTeam(item),
        contributor: getContributor(item),
      bugCount: getBugCount(item),
        complexity: getComplexityLevel(item),
        timeToRelease: getTimeToRelease(item),
        dependencies: getDependencies(item)
      };
      
      console.log('Processed item:', processedItem);
      return processedItem;
      
    } catch (error) {
      console.warn('Error processing item:', item, error);
      return null;
    }
  }).filter(item => item !== null); // Remove any failed items
  
  console.log('Filtering data by date range...');
  
  // Filter to only include data in the specified date range
  const filteredData = processedData.filter(item => {
    const date = new Date(item.date);
    return date >= DATE_RANGE.start && date <= DATE_RANGE.end;
  });
  
  console.log('Final processed data count:', filteredData.length);
  return filteredData;
}

// Extract team information 
function getTeam(item) {
  // For demonstration - in a real app this would pull from actual data
  const teams = ['Frontend', 'Backend', 'Mobile', 'Security', 'Infrastructure', 'Design', 'API', 'QA', 'DevOps'];
  return teams[Math.floor(Math.random() * teams.length)];
}

// Extract contributor information (individual engineer)
function getContributor(item) {
  // For demonstration - in a real app this would pull from actual data
  const contributors = [
    'Sarah Chen', 'Michael Johnson', 'Amit Patel', 'Jessica Kim',
    'Carlos Rodriguez', 'Emma Thompson', 'David Wilson', 'Olga Petrov',
    'Marcus Lee', 'Hannah Garcia', 'James Moore', 'Fatima Ali',
    'Ryan Taylor', 'Sophia Martinez', 'Noah Anderson', 'Wei Zhang'
  ];
  return contributors[Math.floor(Math.random() * contributors.length)];
}

// Extract bug count
function getBugCount(item) {
  // In a real implementation, this would pull from actual bug data
  return Math.floor(Math.random() * 5);
}

// Determine complexity level based on description and other factors
function getComplexityLevel(item) {
  const complexityLevels = ['Low', 'Medium', 'High'];
  return complexityLevels[Math.floor(Math.random() * 3)];
}

// Get time to release (days from feature development to release)
function getTimeToRelease(item) {
  // In a real implementation, this would be calculated from actual timeline data
  return Math.floor(Math.random() * 30 + 10); // 10-40 days
}

// Get feature dependencies
function getDependencies(item) {
  // In a real implementation, this would list actual dependencies
  const allDependencies = ['API', 'Authentication', 'Database', 'Frontend', 'Notifications', 'Payments'];
  const count = Math.floor(Math.random() * 3); // 0-2 dependencies
  
  // Randomly select 'count' dependencies
  const dependencies = [];
  for (let i = 0; i < count; i++) {
    const dep = allDependencies[Math.floor(Math.random() * allDependencies.length)];
    if (!dependencies.includes(dep)) {
      dependencies.push(dep);
    }
  }
  
  return dependencies;
}

// Determine impact level based on description
function getImpactLevel(description) {
  const lowImpactKeywords = ['minor', 'small', 'fix', 'tweak'];
  const highImpactKeywords = ['major', 'significant', 'new', 'revolutionary', 'transform'];
  
  if (!description) return 'Medium';
  
  const descLower = description.toLowerCase();
  
  for (const keyword of highImpactKeywords) {
    if (descLower.includes(keyword)) {
      return 'High';
    }
  }
  
  for (const keyword of lowImpactKeywords) {
    if (descLower.includes(keyword)) {
      return 'Low';
    }
  }
  
  return 'Medium'; // Default impact level
}

// Add this function after the getCategoryColor function
function getHeatmapColor(count, maxCount, scheme) {
  const colorScheme = heatmapColors[scheme] || heatmapColors.blue;
  const intensity = Math.min(1, count / maxCount);
  const intensityValue = Math.pow(intensity, 0.5); // Square root for better visual distribution
  
  if (scheme === 'rainbow') {
    const hue = 240 - (intensityValue * 240); // Blue to red
    return `hsl(${hue}, 100%, ${50 + (intensityValue * 25)}%)`;
  }
  
  // For other schemes, interpolate between min and max colors
  const minColor = colorScheme.min;
  const maxColor = colorScheme.max;
  return `color-mix(in srgb, ${minColor} ${(1 - intensityValue) * 100}%, ${maxColor})`;
}

// Setup event listeners
function setupEventListeners() {
  // Quarter navigation
  elements.prevQuarterBtn.addEventListener('click', () => {
    if (state.selectedQuarter > 0) {
      state.selectedQuarter--;
    } else if (state.year > state.yearRange.min) {
      state.selectedQuarter = 3;
      state.year--;
    }
    updateQuarterLabel();
    renderQuarterlyCalendar();
  });

  elements.nextQuarterBtn.addEventListener('click', () => {
    if (state.selectedQuarter < 3) {
      state.selectedQuarter++;
    } else if (state.year < state.yearRange.max) {
      state.selectedQuarter = 0;
      state.year++;
    }
    updateQuarterLabel();
    renderQuarterlyCalendar();
  });

  // Heatmap color slider
  elements.heatmapColor.addEventListener('input', (e) => {
    const hue = e.target.value;
    const colorName = getColorName(hue);
    elements.colorValue.textContent = colorName;
    renderQuarterlyCalendar();
  });

  // Add click handler for calendar days
  elements.quarterlyCalendar.addEventListener('click', (e) => {
    const dayCell = e.target.closest('.calendar-day');
    if (dayCell) {
      // Remove selected class from all days
      document.querySelectorAll('.calendar-day').forEach(cell => {
        cell.classList.remove('selected');
      });
      
      // Add selected class to clicked day
      dayCell.classList.add('selected');
      
      // Get the date from the day cell
      const day = parseInt(dayCell.querySelector('.day-number').textContent);
      const month = parseInt(dayCell.closest('.month-container').dataset.month);
      const year = parseInt(dayCell.closest('.month-container').dataset.year);
      
      // Show day details
      showDayDetails(day, month, year);
    }
  });
}

// Update quarter label
function updateQuarterLabel() {
  if (elements.quarterLabel) {
    elements.quarterLabel.textContent = `Q${state.selectedQuarter + 1} ${state.year}`;
  }
  
  // Update quarter and year in stats panel
  if (elements.quarterNumber) {
    elements.quarterNumber.textContent = state.selectedQuarter + 1;
  }
  
  if (elements.yearNumber) {
    elements.yearNumber.textContent = state.year;
  }
}

// Render quarterly calendar
function renderQuarterlyCalendar() {
  if (!state.data || state.data.length === 0) {
    console.warn('No data available for rendering calendar');
    return;
  }

  const hue = elements.heatmapColor.value;
  const monthsInQuarter = getMonthsInQuarter(state.year, state.selectedQuarter);
  
  // Clear previous calendar
  elements.quarterlyCalendar.innerHTML = '';
  
  // Find max features in the quarter for heatmap scaling
  let maxFeatures = 0;
  monthsInQuarter.forEach(({ month, year }) => {
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const features = getFeaturesForDay(day, month, year);
      maxFeatures = Math.max(maxFeatures, features.length);
    }
  });
  
  // Create month containers
  monthsInQuarter.forEach(({ month, year }) => {
    const monthContainer = document.createElement('div');
    monthContainer.className = 'month-container';
    monthContainer.dataset.month = month;
    monthContainer.dataset.year = year;
    
    // Count features for this month
    const monthFeatures = state.data.filter(feature => {
      const featureDate = new Date(feature.date);
      return featureDate.getFullYear() === year && featureDate.getMonth() === month;
    });
    
    // Add month header with feature count
    const monthHeader = document.createElement('div');
    monthHeader.className = 'month-header';
    monthHeader.innerHTML = `${monthNames[month]} <span class="month-feature-count">(${monthFeatures.length})</span>`;
    monthContainer.appendChild(monthHeader);
    
    // Add month grid
    const monthGrid = document.createElement('div');
    monthGrid.className = 'month-grid';
    monthContainer.appendChild(monthGrid);
  
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(dayName => {
      const headerCell = document.createElement('div');
      headerCell.className = 'calendar-header-cell';
      headerCell.textContent = dayName;
      monthGrid.appendChild(headerCell);
    });
    
    // Add empty cells for days before the first day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    
    for (let i = 0; i < startingDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day empty';
      monthGrid.appendChild(emptyCell);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      
      // Get features for this day
      const features = getFeaturesForDay(day, month, year);
      if (features.length > 0) {
        dayCell.classList.add('has-releases');
        
        // Add heatmap color based on number of features
        const intensity = Math.min(1, features.length / maxFeatures);
        const lightness = 100 - (intensity * 50); // Darker for more features
        dayCell.style.backgroundColor = getHSLColor(hue, 70, lightness);
      }
      
      // Add day number
      const dayNumber = document.createElement('div');
      dayNumber.className = 'day-number';
      dayNumber.textContent = day;
      dayCell.appendChild(dayNumber);
    
      // Add release count
      if (features.length > 0) {
        const releaseCount = document.createElement('div');
        releaseCount.className = 'day-releases';
        releaseCount.textContent = features.length;
        dayCell.appendChild(releaseCount);
        
        // Add treemap using the updated renderDayTreemap function
        const treemap = renderDayTreemap(features, false);
        dayCell.appendChild(treemap);
      }
      
      // Add days since last release
      const daysSince = calculateDaysSinceLastRelease(day, month, year);
      if (daysSince > 0) {
        const daysSinceElement = document.createElement('div');
        daysSinceElement.className = 'days-since-release';
        daysSinceElement.textContent = `${daysSince}d`;
        dayCell.appendChild(daysSinceElement);
      }
      
      // Add click handler for day cell
      dayCell.addEventListener('click', () => {
        // Show day details
        showDayDetails(day, month, year);
      });
      
      monthGrid.appendChild(dayCell);
    }
    
    elements.quarterlyCalendar.appendChild(monthContainer);
  });
  
  // Update quarterly statistics
  updateQuarterlyStats();
}

// Get features for a specific day
function getFeaturesForDay(day, month, year) {
  const date = new Date(year, month, day);
  return state.data.filter(feature => {
    const featureDate = new Date(feature.date);
    return featureDate.getFullYear() === date.getFullYear() &&
           featureDate.getMonth() === date.getMonth() &&
           featureDate.getDate() === date.getDate();
  });
}

// Calculate days since last release
function calculateDaysSinceLastRelease(day, month, year) {
  const currentDate = new Date(year, month, day);
  const previousReleases = state.data.filter(feature => {
    const featureDate = new Date(feature.date);
    return featureDate < currentDate;
  });
  
  if (previousReleases.length === 0) return 0;
  
  const lastReleaseDate = new Date(Math.max(...previousReleases.map(f => new Date(f.date))));
  return Math.floor((currentDate - lastReleaseDate) / (1000 * 60 * 60 * 24));
}

/**
 * Renders a treemap showing feature categories for a specific day
 * @param {Array} features - Array of features for the day
 * @param {boolean} isDetailsView - Whether this is for the details view
 * @return {HTMLElement} - The treemap container element
 */
function renderDayTreemap(features, isDetailsView = false) {
  // Create container
  const container = document.createElement('div');
  container.className = isDetailsView ? 'day-details-treemap' : 'day-treemap';
  
  // If no features, show empty message
  if (!features || features.length === 0) {
    container.innerHTML = '<div class="treemap-empty">No features</div>';
    return container;
  }
  
  // Group features by category
  const categoryData = {};
  features.forEach(feature => {
    const category = feature.category || 'Uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = {
        name: category,
        value: 0,
        color: getCategoryColor(category),
        features: []
      };
    }
    categoryData[category].value += 1;
    categoryData[category].features.push(feature);
  });
  
  // Convert to array and sort by value (descending)
  const treemapData = Object.values(categoryData).sort((a, b) => b.value - a.value);
  
  // Calculate total value
  const totalValue = treemapData.reduce((sum, item) => sum + item.value, 0);
  
  // Set dimensions based on view type - will be applied with CSS
  const width = 100; // These are just for the algorithm calculation
  const height = isDetailsView ? 100 : 100; // Use same aspect ratio for calculation
  
  // Create treemap using squarify algorithm
  const treemap = squarifyTreemap(treemapData, {
    x0: 0,
    y0: 0,
    x1: width,
    y1: height
  }, totalValue);
  
  // Create and append treemap cells
  treemap.forEach(node => {
    const cellElement = document.createElement('div');
    cellElement.className = 'treemap-cell';
    
    // Use percentage for positioning to make it responsive
    cellElement.style.left = `${(node.x0 / width) * 100}%`;
    cellElement.style.top = `${(node.y0 / height) * 100}%`;
    cellElement.style.width = `${((node.x1 - node.x0) / width) * 100}%`;
    cellElement.style.height = `${((node.y1 - node.y0) / height) * 100}%`;
    cellElement.style.backgroundColor = node.data.color;
    
    // Add label
    const label = document.createElement('div');
    label.className = 'treemap-cell-label';
    label.textContent = `${node.data.name} (${node.data.value})`;
    cellElement.appendChild(label);
    
    // Add click handler for details view
    if (isDetailsView) {
      cellElement.addEventListener('click', (e) => {
        e.stopPropagation();
        // Filter feature list to show only selected category
        const featuresList = document.querySelector('.day-details-content');
        if (featuresList) {
          // Clear existing content
          featuresList.innerHTML = '';
          
          // Add category header
          const categoryHeader = document.createElement('h3');
          categoryHeader.textContent = `${node.data.name} (${node.data.features.length})`;
          categoryHeader.style.color = node.data.color;
          featuresList.appendChild(categoryHeader);
          
          // Render features for this category
          node.data.features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            
            const description = document.createElement('div');
            description.className = 'feature-description';
            description.textContent = feature.description;
            
            featureItem.appendChild(description);
            featuresList.appendChild(featureItem);
          });
        }
      });
  } else {
      // For day cell, make the whole cell clickable to show details
      cellElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const dayCell = cellElement.closest('.calendar-day');
        if (dayCell) {
          const day = parseInt(dayCell.querySelector('.day-number').textContent);
          const monthContainer = dayCell.closest('.month-container');
          const month = parseInt(monthContainer.dataset.month);
          const year = parseInt(monthContainer.dataset.year);
          showDayDetails(day, month, year);
        }
      });
    }
    
    container.appendChild(cellElement);
  });
  
  return container;
}

/**
 * Find the best number of items for the next row/column
 * @param {Array} data - Remaining data items
 * @param {number} scale - Scale factor for mapping values to pixels
 * @param {number} length - Available length for the row/column
 * @returns {Object} - Best row information
 */
function findBestRow(data, scale, length) {
  if (!data.length) return { items: [], width: 0, height: 0 };
  
  let bestAspectRatio = Infinity;
  let bestCount = 1;
  
  for (let i = 1; i <= data.length; i++) {
    const row = data.slice(0, i);
    const rowSum = row.reduce((sum, d) => sum + d.value, 0);
    const rowWidth = Math.max(rowSum * scale / length, 0.1); // Prevent division by zero
    
    // For each item, calculate the worst aspect ratio
    let worstRatio = 0;
    for (let j = 0; j < i; j++) {
      const itemValue = data[j].value;
      const itemWidth = itemValue * scale / length;
      const itemHeight = itemValue / rowSum;
      // Aspect ratio is max(width/height, height/width)
      const itemRatio = Math.max(itemWidth/itemHeight, itemHeight/itemWidth);
      worstRatio = Math.max(worstRatio, itemRatio);
    }
    
    // If this row has a better worst-case aspect ratio, remember it
    if (worstRatio < bestAspectRatio) {
      bestAspectRatio = worstRatio;
      bestCount = i;
    } else {
      // If ratio starts getting worse, we've found the optimal count
      break;
    }
  }
  
  const items = data.slice(0, bestCount);
  const rowSum = items.reduce((sum, d) => sum + d.value, 0);
    
  return {
    items,
    sum: rowSum,
    aspectRatio: bestAspectRatio
  };
}

/**
 * Implements the squarify treemap algorithm to create rectangles with good aspect ratios
 * Based on the squarified treemap algorithm by Bruls, Huizing, and van Wijk
 * @param {Array} data - Array of data objects with value property
 * @param {Object} bounds - The bounds of the rectangle {x0, y0, x1, y1}
 * @param {number} totalValue - Sum of all values
 * @returns {Array} - Array of rectangles with positions
 */
function squarifyTreemap(data, bounds, totalValue) {
  const result = [];
  const { x0, y0, x1, y1 } = bounds;
  const width = x1 - x0;
  const height = y1 - y0;
  
  // Skip if no data or invalid dimensions
  if (!data.length || width <= 0 || height <= 0) {
    return result;
  }
  
  // Copy data to avoid modifying the original
  let remaining = [...data];
  
  // Current position
  let currentX = x0;
  let currentY = y0;
  let currentWidth = width;
  let currentHeight = height;
  
  // Process in order of descending value (already sorted)
  while (remaining.length > 0) {
    // Determine layout direction (use shorter side for better squarification)
    const isHorizontal = currentWidth < currentHeight;
    
    // Calculate scale
    const currentArea = currentWidth * currentHeight;
    const remainingValue = remaining.reduce((sum, d) => sum + d.value, 0);
    const scale = remainingValue > 0 ? currentArea / remainingValue : 0;
    
    // Find the best row
    const shortSide = isHorizontal ? currentWidth : currentHeight;
    const bestRow = findBestRow(remaining, scale, shortSide);
    
    // Layout the row/column
    const rowBounds = {
      x0: currentX,
      y0: currentY,
      x1: isHorizontal ? currentX + currentWidth : x1,
      y1: isHorizontal ? y1 : currentY + currentHeight
    };
    
    layoutRow(bestRow.items, rowBounds, isHorizontal, totalValue, result);
    
    // Update remaining data
    remaining = remaining.slice(bestRow.items.length);
    
    // Update current position for next row/column
    if (isHorizontal) {
      // Move down
      const rowHeight = (bestRow.sum / remainingValue) * currentHeight;
      currentY += rowHeight;
      currentHeight -= rowHeight;
    } else {
      // Move right
      const rowWidth = (bestRow.sum / remainingValue) * currentWidth;
      currentX += rowWidth;
      currentWidth -= rowWidth;
    }
    
    // If the remaining area is too small, stop
    if (currentWidth <= 1 || currentHeight <= 1) {
      break;
    }
  }
  
  return result;
}

/**
 * Layout a single row or column of the treemap
 * @param {Array} items - Data items for this row/column
 * @param {Object} bounds - Bounds for this row/column
 * @param {boolean} isHorizontal - Whether to layout horizontally
 * @param {number} totalValue - Total value of all data items
 * @param {Array} result - Array to push results to
 */
function layoutRow(items, bounds, isHorizontal, totalValue, result) {
  const { x0, y0, x1, y1 } = bounds;
  const width = x1 - x0;
  const height = y1 - y0;
  
  let currentPosition = isHorizontal ? x0 : y0;
  const rowSum = items.reduce((sum, d) => sum + d.value, 0);
  
  items.forEach(item => {
    // Calculate the size proportionally based on the item's value
    const size = (item.value / rowSum) * (isHorizontal ? width : height);
    
    // For horizontal layout, vary the width; for vertical layout, vary the height
    const node = {
      data: item,
      x0: isHorizontal ? currentPosition : x0,
      y0: isHorizontal ? y0 : currentPosition,
      x1: isHorizontal ? currentPosition + size : x1,
      y1: isHorizontal ? y1 : currentPosition + size
    };
    
    result.push(node);
    currentPosition += size;
  });
}

// Helper function to render feature items
function renderFeatureItems(features, container) {
  features.forEach(feature => {
      const featureItem = document.createElement('div');
      featureItem.className = 'feature-item';
      
      const featureHeader = document.createElement('div');
      featureHeader.className = 'feature-header';
      
      // Category indicator
      const categoryTag = document.createElement('span');
      categoryTag.className = 'feature-category';
      categoryTag.textContent = feature.category;
      const categoryColor = getCategoryColor(feature.category);
      categoryTag.style.backgroundColor = `${categoryColor}20`; // 20% opacity
      categoryTag.style.color = categoryColor;
      featureHeader.appendChild(categoryTag);
      
      // Impact indicator
      const impactIndicator = document.createElement('span');
      impactIndicator.className = `impact-label impact-${feature.impact.toLowerCase()}`;
      impactIndicator.textContent = feature.impact;
      featureHeader.appendChild(impactIndicator);
    
    // Team indicator
    const teamIndicator = document.createElement('span');
    teamIndicator.className = 'team-label';
    teamIndicator.textContent = feature.team;
    featureHeader.appendChild(teamIndicator);
      
      // Date
      const dateDisplay = document.createElement('span');
      dateDisplay.className = 'feature-date';
      dateDisplay.textContent = new Date(feature.date).toLocaleDateString();
      featureHeader.appendChild(dateDisplay);
      
      featureItem.appendChild(featureHeader);
      
      // Description
      const description = document.createElement('p');
      description.className = 'feature-description';
      description.textContent = feature.description;
      
      // Feature metadata
      const metadata = document.createElement('div');
      metadata.className = 'feature-metadata';
      metadata.innerHTML = `
        <span class="metadata-item">Bug Count: ${feature.bugCount}</span>
        <span class="metadata-item">Time to Release: ${feature.timeToRelease} days</span>
        <span class="metadata-item">Complexity: ${feature.complexity}</span>
      `;
      
      featureItem.appendChild(description);
      featureItem.appendChild(metadata);
    container.appendChild(featureItem);
  });
}

// Helper function to get color name from hue
function getColorName(hue) {
  const hueValue = parseInt(hue);
  if (hueValue < 30) return 'Red';
  if (hueValue < 60) return 'Orange';
  if (hueValue < 90) return 'Yellow';
  if (hueValue < 150) return 'Green';
  if (hueValue < 210) return 'Cyan';
  if (hueValue < 270) return 'Blue';
  if (hueValue < 330) return 'Purple';
  return 'Red';
}

// Add this function after the getColorName function
function getHSLColor(hue, saturation, lightness) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Add this function after the getHSLColor function
function getMonthsInQuarter(year, quarter) {
  const months = [];
  for (let i = 0; i < 3; i++) {
    const month = (quarter * 3) + i;
    months.push({
      month: month,
      year: year
    });
  }
  return months;
}

// Add showDayDetails function
function showDayDetails(day, month, year) {
  const features = getFeaturesForDay(day, month, year);
  if (features.length === 0) return;
  
  // Remove any existing day details
  const existingDetails = document.querySelector('.day-details');
  if (existingDetails) {
    existingDetails.remove();
  }
  
  const existingOverlay = document.querySelector('.overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay visible';
  document.body.appendChild(overlay);
  
  // Create day details panel
  const dayDetails = document.createElement('div');
  dayDetails.className = 'day-details visible';
  
  // Add header
  const header = document.createElement('div');
  header.className = 'day-details-header';
  header.innerHTML = `
    <h2 class="day-details-title">${monthNames[month]} ${day}, ${year}</h2>
    <span class="day-details-close">&times;</span>
  `;
  dayDetails.appendChild(header);
  
  // Add large treemap
  const treemapContainer = document.createElement('div');
  treemapContainer.className = 'day-details-treemap-container';
  const largeTreemap = renderDayTreemap(features, true);
  treemapContainer.appendChild(largeTreemap);
  dayDetails.appendChild(treemapContainer);
  
  // Add features list with header
  const featuresHeader = document.createElement('h3');
  featuresHeader.textContent = `Features (${features.length})`;
  featuresHeader.style.margin = '16px 0 12px 0';
  dayDetails.appendChild(featuresHeader);
  
  // Add content container for features
  const content = document.createElement('div');
  content.className = 'day-details-content';
  
  // Group features by category for display
  const groupedFeatures = {};
  features.forEach(feature => {
    const category = feature.category || 'Uncategorized';
    if (!groupedFeatures[category]) {
      groupedFeatures[category] = [];
    }
    groupedFeatures[category].push(feature);
  });
  
  // Display features grouped by category
  Object.entries(groupedFeatures).forEach(([category, categoryFeatures]) => {
    // Add category header
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.style.backgroundColor = getCategoryColor(category) + '20'; // 20% opacity
    categoryHeader.style.padding = '8px 12px';
    categoryHeader.style.borderRadius = '4px';
    categoryHeader.style.marginBottom = '8px';
    categoryHeader.style.fontWeight = '600';
    categoryHeader.style.color = getCategoryColor(category);
    categoryHeader.textContent = `${category} (${categoryFeatures.length})`;
    content.appendChild(categoryHeader);
    
    // Add features in this category
    categoryFeatures.forEach(feature => {
    const featureItem = document.createElement('div');
    featureItem.className = 'feature-item';
    
      const description = document.createElement('div');
    description.className = 'feature-description';
    description.textContent = feature.description;
    
    featureItem.appendChild(description);
      content.appendChild(featureItem);
    });
  });
  
  dayDetails.appendChild(content);
  document.body.appendChild(dayDetails);
  
  // Add close handler
  const closeBtn = dayDetails.querySelector('.day-details-close');
  closeBtn.addEventListener('click', () => {
    dayDetails.remove();
    overlay.remove();
  });
  
  // Close when clicking overlay
  overlay.addEventListener('click', () => {
    dayDetails.remove();
    overlay.remove();
  });
}

// Update quarterly statistics
function updateQuarterlyStats() {
  if (!state.data || state.data.length === 0) return;
  
  // Get features for the current quarter
  const currentQuarterFeatures = getQuarterFeatures(state.year, state.selectedQuarter);
  
  // Update total features count
  if (elements.totalFeaturesValue) {
    elements.totalFeaturesValue.textContent = currentQuarterFeatures.length;
  }
  
  // Update category stats chart
  updateCategoryStats(currentQuarterFeatures);
}

// Get features for a specific quarter
function getQuarterFeatures(year, quarter) {
  const startMonth = quarter * 3;
  const endMonth = startMonth + 2;
  
  return state.data.filter(feature => {
    const featureDate = new Date(feature.date);
    const featureYear = featureDate.getFullYear();
    const featureMonth = featureDate.getMonth();
    
    return featureYear === year && featureMonth >= startMonth && featureMonth <= endMonth;
  });
}

// Update category stats
function updateCategoryStats(features) {
  if (!elements.quarterlyStatsChart) return;
  
  // Clear previous content
  elements.quarterlyStatsChart.innerHTML = '';
  
  // Get all categories from the entire dataset
  const allCategories = {};
  state.data.forEach(feature => {
    const category = feature.category || 'Uncategorized';
    allCategories[category] = {
      name: category,
      count: 0,
      color: getCategoryColor(category)
    };
  });
  
  // Update counts for categories in the current quarter
  features.forEach(feature => {
    const category = feature.category || 'Uncategorized';
    allCategories[category].count += 1;
  });
  
  // Convert to array and sort by count (descending)
  const sortedCategories = Object.values(allCategories)
    .sort((a, b) => b.count - a.count);
  
  // Create category items
  sortedCategories.forEach(category => {
      const categoryItem = document.createElement('div');
      categoryItem.className = 'category-item';
      
    const categoryDot = document.createElement('div');
      categoryDot.className = 'category-dot';
    categoryDot.style.backgroundColor = category.color;
      
    const categoryName = document.createElement('div');
      categoryName.className = 'category-name';
    categoryName.textContent = category.name;
      
    const categoryCount = document.createElement('div');
      categoryCount.className = 'category-count';
    categoryCount.textContent = category.count;
      
      categoryItem.appendChild(categoryDot);
      categoryItem.appendChild(categoryName);
      categoryItem.appendChild(categoryCount);
      
    elements.quarterlyStatsChart.appendChild(categoryItem);
  });
  
  // If no categories, show message
  if (sortedCategories.length === 0) {
    elements.quarterlyStatsChart.innerHTML = '<div style="color: #6c757d; font-style: italic;">No data available</div>';
  }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);