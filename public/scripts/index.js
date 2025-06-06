const API_BASE_URL = 'http://localhost:3000';

// State management
let currentResults = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
});

/**
 * Initialize form by loading dropdown options from the backend
 * This demonstrates how to populate form controls with dynamic data
 */
async function initializeForm() {
    try {
        // Load categories from the backend
        const categoriesResponse = await fetch(`${API_BASE_URL}/apps/categories`);
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            const categorySelect = document.getElementById('category');
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }

        // Load content ratings from the backend
        const ratingsResponse = await fetch(`${API_BASE_URL}/apps/contentRatings`);
        if (ratingsResponse.ok) {
            const ratings = await ratingsResponse.json();
            const ratingSelect = document.getElementById('contentRating');
            
            ratings.forEach(rating => {
                const option = document.createElement('option');
                option.value = rating;
                option.textContent = rating;
                ratingSelect.appendChild(option);
            });
        }

        // Load permission types from the backend
        // This calls the permissions API to get all available permission types
        const permissionTypesResponse = await fetch(`${API_BASE_URL}/permissions/types`);
        if (permissionTypesResponse.ok) {
            const permissionTypes = await permissionTypesResponse.json();
            const permissionTypesSelect = document.getElementById('permissionTypes');
            
            // Clear the loading message
            permissionTypesSelect.innerHTML = '';
            
            // Add an "All Types" option for when no specific types are selected
            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'All Permission Types';
            permissionTypesSelect.appendChild(allOption);
            
            // Add each permission type as an option
            permissionTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
                permissionTypesSelect.appendChild(option);
            });
        } else {
            // If we can't load permission types, show a fallback message
            const permissionTypesSelect = document.getElementById('permissionTypes');
            permissionTypesSelect.innerHTML = '<option value="">Permission types unavailable</option>';
        }
    } catch (error) {
        console.error('Error loading form data:', error);
        // Continue without dynamic options if backend is unavailable
        const permissionTypesSelect = document.getElementById('permissionTypes');
        permissionTypesSelect.innerHTML = '<option value="">Error loading permission types</option>';
    }
}

/**
 * Set up event listeners for form interaction
 */
function setupEventListeners() {
    const form = document.getElementById('searchForm');
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Handle form submission and execute the search
 * This is the core function that connects your form to your backend API
 */
async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission behavior
    
    const queryParams = new URLSearchParams();
    
    // Handle regular form fields
    const formData = new FormData(event.target);
    for (const [key, value] of formData.entries()) {
        if (value.trim() !== '' && key !== 'permissionTypes') {
            queryParams.append(key, value.trim());
        }
    }
    
    // Handle the multi-select permission types field specially
    // This demonstrates how to work with complex form inputs
    const permissionTypesSelect = document.getElementById('permissionTypes');
    const selectedTypes = Array.from(permissionTypesSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== ''); // Remove empty values
    
    // If specific permission types are selected, we need to make a two-step process:
    // 1. First get apps that match other criteria
    // 2. Then filter based on permission types
    let searchUrl = `${API_BASE_URL}/apps`;
    let isPermissionFiltered = selectedTypes.length > 0;
    
    if (isPermissionFiltered) {
        // When filtering by permission types, we need to search the permissions endpoint
        // and then cross-reference with the apps
        await searchWithPermissionFilter(queryParams, selectedTypes);
        return; // Exit early since we're handling this case differently
    }
    
    // For searches without permission type filtering, use the standard approach
    if (queryParams.toString()) {
        searchUrl += '?' + queryParams.toString();
    }

    // Show loading state
    showLoading();

    try {
        // Make the API call to your backend
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const results = await response.json();
        currentResults = results;
        
        // Display the results
        displayResults(results);
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to fetch search results. Please check if the backend server is running on port 3000.');
    }
}

/**
 * Handle searches that include permission type filtering
 * This demonstrates a more complex search strategy that coordinates multiple API calls
 */
async function searchWithPermissionFilter(queryParams, selectedTypes) {
    showLoading();
    
    try {
        // Step 1: Get apps that match the permission type criteria
        const permissionQuery = new URLSearchParams();
        permissionQuery.append('types', selectedTypes.join(','));
        permissionQuery.append('limit', '100'); // Get more results to ensure we have enough
        
        const permissionsResponse = await fetch(`${API_BASE_URL}/permissions?${permissionQuery.toString()}`);
        if (!permissionsResponse.ok) {
            throw new Error('Failed to fetch permissions data');
        }
        
        const permissionsData = await permissionsResponse.json();
        
        // Extract the app IDs that have the desired permission types
        const appIdsWithDesiredPermissions = permissionsData.map(permission => permission.appId);
        
        if (appIdsWithDesiredPermissions.length === 0) {
            // No apps found with the selected permission types
            displayResults([]);
            return;
        }
        
        // Step 2: Get app details for those app IDs, applying other filters
        const appSearchPromises = appIdsWithDesiredPermissions.map(async (appId) => {
            const appQuery = new URLSearchParams(queryParams);
            appQuery.append('appId', appId);
            
            try {
                const response = await fetch(`${API_BASE_URL}/apps?${appQuery.toString()}`);
                if (response.ok) {
                    const results = await response.json();
                    return results;
                }
            } catch (error) {
                console.warn(`Failed to fetch app ${appId}:`, error);
            }
            return [];
        });
        
        // Wait for all app searches to complete
        const appSearchResults = await Promise.all(appSearchPromises);
        
        // Flatten the results and remove duplicates
        const allResults = appSearchResults.flat();
        const uniqueResults = allResults.filter((app, index, self) => 
            index === self.findIndex(other => other['App Id'] === app['App Id'])
        );
        
        currentResults = uniqueResults;
        displayResults(uniqueResults);
        
    } catch (error) {
        console.error('Permission-filtered search error:', error);
        showError('Failed to search by permission types. Please try again or search without permission filtering.');
    }
}

/**
 * Display search results in a formatted table
 * This function handles the complex task of presenting your data clearly
 */
function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const tableContainer = document.getElementById('tableContainer');
    const resultsCount = document.getElementById('resultsCount');
    
    // Update results count
    resultsCount.textContent = `Found ${results.length} app${results.length !== 1 ? 's' : ''}`;
    
    if (results.length === 0) {
        tableContainer.innerHTML = '<div class="no-results">No apps found matching your criteria. Try adjusting your search parameters.</div>';
        resultsSection.style.display = 'block';
        return;
    }

    // Create the results table
    const table = document.createElement('table');
    
    // Create table header
    const headerRow = table.insertRow();
    const headers = [
        'App Name', 'App ID', 'Category', 'Rating', 'Price', 
        'Content Rating', 'Developer ID', 'Installs', 'Permissions'
    ];
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    // Create table rows for each result
    results.forEach(app => {
        const row = table.insertRow();
        
        // App Name
        const nameCell = row.insertCell();
        nameCell.textContent = app['App Name'] || 'N/A';
        
        // App ID
        const idCell = row.insertCell();
        idCell.textContent = app['App Id'] || 'N/A';
        
        // Category
        const categoryCell = row.insertCell();
        categoryCell.textContent = app['Category'] || 'N/A';
        
        // Rating
        const ratingCell = row.insertCell();
        ratingCell.textContent = app['Rating'] ? app['Rating'].toFixed(1) : 'N/A';
        
        // Price
        const priceCell = row.insertCell();
        priceCell.textContent = app['Price'] ? `$${app['Price'].toFixed(2)}` : 'Free';
        
        // Content Rating
        const contentRatingCell = row.insertCell();
        contentRatingCell.textContent = app['Content Rating'] || 'N/A';
        
        // Developer ID
        const developerCell = row.insertCell();
        developerCell.textContent = app['Developer Id'] || 'N/A';
        
        // Maximum Installs
        const installsCell = row.insertCell();
        installsCell.textContent = app['Maximum Installs'] ? formatNumber(app['Maximum Installs']) : 'N/A';
        
        // Permissions
        const permissionsCell = row.insertCell();
        permissionsCell.className = 'permissions-cell';
        
        if (app.permissions && app.permissions.length > 0) {
            const permissionsContainer = document.createElement('div');
            
            app.permissions.forEach(permission => {
                const tag = document.createElement('span');
                tag.className = `permission-tag ${getPermissionClass(permission.type)}`;
                tag.textContent = permission.permission;
                tag.title = `Type: ${permission.type}`;
                permissionsContainer.appendChild(tag);
            });
            
            permissionsCell.appendChild(permissionsContainer);
        } else {
            permissionsCell.textContent = 'No permissions data';
        }
    });

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
    resultsSection.style.display = 'block';
}

/**
 * Show loading state while fetching results
 */
function showLoading() {
    const resultsSection = document.getElementById('resultsSection');
    const tableContainer = document.getElementById('tableContainer');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = '';
    tableContainer.innerHTML = '<div class="loading">Searching for apps...</div>';
    resultsSection.style.display = 'block';
}

/**
 * Display error message to the user
 */
function showError(message) {
    const resultsSection = document.getElementById('resultsSection');
    const tableContainer = document.getElementById('tableContainer');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = '';
    tableContainer.innerHTML = `<div class="error">${message}</div>`;
    resultsSection.style.display = 'block';
}

/**
 * Clear all form fields
 */
function clearForm() {
    document.getElementById('searchForm').reset();
    document.getElementById('resultsSection').style.display = 'none';
    currentResults = [];
}

/**
 * Helper function to format large numbers
 */
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Helper function to style permission tags based on their type
 */
function getPermissionClass(type) {
    if (type === 'dangerous') {
        return 'permission-dangerous';
    }
    if (type === 'normal') {
        return 'permission-normal';
    }
    return '';
}