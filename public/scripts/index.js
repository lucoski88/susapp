const API_BASE_URL = 'http://localhost:3000';

// State management
let currentResults = [];
let currentManageData = [];

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
            
            // Populate search form category dropdown
            const categorySelect = document.getElementById('category');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });

            // Populate create form category dropdown
            const createCategorySelect = document.getElementById('createCategory');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                createCategorySelect.appendChild(option);
            });

            // Populate edit form category dropdown
            const editCategorySelect = document.getElementById('editCategory');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                editCategorySelect.appendChild(option);
            });
        }

        // Load content ratings from the backend
        const ratingsResponse = await fetch(`${API_BASE_URL}/apps/contentRatings`);
        if (ratingsResponse.ok) {
            const ratings = await ratingsResponse.json();
            
            // Populate search form content rating dropdown
            const ratingSelect = document.getElementById('contentRating');
            ratings.forEach(rating => {
                const option = document.createElement('option');
                option.value = rating;
                option.textContent = rating;
                ratingSelect.appendChild(option);
            });

            // Populate create form content rating dropdown
            const createRatingSelect = document.getElementById('createContentRating');
            ratings.forEach(rating => {
                const option = document.createElement('option');
                option.value = rating;
                option.textContent = rating;
                createRatingSelect.appendChild(option);
            });

            // Populate edit form content rating dropdown
            const editRatingSelect = document.getElementById('editContentRating');
            ratings.forEach(rating => {
                const option = document.createElement('option');
                option.value = rating;
                option.textContent = rating;
                editRatingSelect.appendChild(option);
            });
        }

        // Load permission types from the backend
        const permissionTypesResponse = await fetch(`${API_BASE_URL}/permissions/types`);
        if (permissionTypesResponse.ok) {
            const permissionTypes = await permissionTypesResponse.json();
            
            // Populate search form permission types dropdown
            const permissionTypesSelect = document.getElementById('permissionTypes');
            permissionTypesSelect.innerHTML = '';
            
            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'All Permission Types';
            permissionTypesSelect.appendChild(allOption);
            
            permissionTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                permissionTypesSelect.appendChild(option);
            });

            // Populate create form permission types dropdown
            const createPermissionTypesSelect = document.getElementById('createPermissionTypes');
            if (createPermissionTypesSelect) {
                createPermissionTypesSelect.innerHTML = '';
                
                const createAllOption = document.createElement('option');
                createAllOption.value = '';
                createAllOption.textContent = 'All Permission Types';
                createPermissionTypesSelect.appendChild(createAllOption);
                
                permissionTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                    createPermissionTypesSelect.appendChild(option);
                });
            }

            // Populate edit form permission types dropdown
            const editPermissionTypesSelect = document.getElementById('editPermissionTypes');
            if (editPermissionTypesSelect) {
                editPermissionTypesSelect.innerHTML = '';
                
                const editAllOption = document.createElement('option');
                editAllOption.value = '';
                editAllOption.textContent = 'All Permission Types';
                editPermissionTypesSelect.appendChild(editAllOption);
                
                permissionTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                    editPermissionTypesSelect.appendChild(option);
                });
            }
        } else {
            const permissionTypesSelect = document.getElementById('permissionTypes');
            permissionTypesSelect.innerHTML = '<option value="">Permission types unavailable</option>';
        }
    } catch (error) {
        console.error('Error loading form data:', error);
        const permissionTypesSelect = document.getElementById('permissionTypes');
        permissionTypesSelect.innerHTML = '<option value="">Error loading permission types</option>';
    }
}

/**
 * Set up event listeners for form interaction
 */
function setupEventListeners() {
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', handleFormSubmit);

    // ADD MISSING EVENT LISTENER FOR CREATE FORM
    const createForm = document.getElementById('createForm');
    createForm.addEventListener('submit', handleCreate);

    // ADD MISSING EVENT LISTENER FOR EDIT FORM
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', handleEdit);
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
        if (queryParams.has('appId')) permissionQuery.append('appId', queryParams.get('appId'));
        if (queryParams.has('appName')) permissionQuery.append('appName', queryParams.get('appName'));
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
            if (!queryParams.has('appId')) appQuery.append('appId', appId);
            
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

// CREATE FUNCTIONALITY
async function handleCreate(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const appData = Object.fromEntries(formData.entries());
    const allPermissions = [];
    const permissionsPairs = document.getElementById("permissionPairsContainer");
    for (let pair of permissionsPairs.children) {
        const select = pair.getElementsByTagName('select')[0];
        const permissionDescription = pair.getElementsByTagName('input')[0];
        const tmpJson = {
            permission: permissionDescription.value,
            type: select.value
        };
        allPermissions.push(tmpJson);
    }
    appData.allPermissions = allPermissions;

    // Convert numeric fields
    if (appData.Rating) appData.Rating = parseFloat(appData.Rating);
    if (appData.Price) appData.Price = parseFloat(appData.Price);
    if (appData['Maximum Installs']) appData['Maximum Installs'] = parseInt(appData['Maximum Installs']);

    showMessage('createMessage', 'Creating app...', 'info');

    try {
        const response = await fetch(`${API_BASE_URL}/apps/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appData)
        });

        if (response.ok) {
            showMessage('createMessage', 'App created successfully!', 'success');
            clearCreateForm();
        } else {
            const error = await response.json();
            showMessage('createMessage', `Error: ${error.error || 'Creation failed'}`, 'error');
        }
    } catch (error) {
        showMessage('createMessage', 'Network error. Please try again.', 'error');
    }
}

function clearCreateForm() {
    document.getElementById('createForm').reset();
}

// MANAGE FUNCTIONALITY
async function loadManageData() {
    const searchTerm = document.getElementById('manageSearch').value;
    const resultsDiv = document.getElementById('manageResults');
    
    resultsDiv.innerHTML = '<div class="loading">Loading apps...</div>';

    try {
        let url = `${API_BASE_URL}/apps?limit=50`;
        if (searchTerm) {
            url += `&appName=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load apps');

        const results = await response.json();
        currentManageData = results;
        displayManageResults(results);
    } catch (error) {
        resultsDiv.innerHTML = '<div class="message error">Failed to load apps. Please try again.</div>';
    }
}

function refreshManageData() {
    document.getElementById('manageSearch').value = '';
    loadManageData();
}

function displayManageResults(results) {
    const resultsDiv = document.getElementById('manageResults');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">No apps found.</div>';
        return;
    }

    const table = createResultsTable(results, true);
    resultsDiv.innerHTML = `
        <h3>Manage Apps (${results.length} apps loaded)</h3>
        <div class="table-container">${table.outerHTML}</div>
    `;
}

function createResultsTable(results, includeActions) {
    const table = document.createElement('table');
    table.className = 'results-table';

    // Create header
    const headers = ['App Name', 'App ID', 'Category', 'Rating', 'Price', 'Content Rating'];
    if (includeActions) headers.push('Actions');

    const headerRow = table.insertRow();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Create rows
    results.forEach(app => {
        const row = table.insertRow();
        
        const nameCell = row.insertCell();
        nameCell.textContent = app['App Name'] || 'N/A';
        
        const idCell = row.insertCell();
        idCell.textContent = app['App Id'] || 'N/A';
        
        const categoryCell = row.insertCell();
        categoryCell.textContent = app['Category'] || 'N/A';
        
        const ratingCell = row.insertCell();
        ratingCell.textContent = app['Rating'] ? app['Rating'].toFixed(1) : 'N/A';
        
        const priceCell = row.insertCell();
        priceCell.textContent = app['Price'] ? `$${app['Price'].toFixed(2)}` : 'Free';
        
        const contentRatingCell = row.insertCell();
        contentRatingCell.textContent = app['Content Rating'] || 'N/A';
        
        if (includeActions) {
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="editApp('${app['App Id']}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteApp('${app['App Id']}')">Delete</button>
                </div>
            `;
        }
    });

    return table;
}

// EDIT FUNCTIONALITY
async function editApp(appId) {
    const app = currentManageData.find(a => a['App Id'] === appId);
    if (!app) return;

    // Populate edit form
    document.getElementById('editAppId').value = appId;
    document.getElementById('editAppName').value = app['App Name'] || '';
    document.getElementById('editCategory').value = app['Category'] || '';
    document.getElementById('editRating').value = app['Rating'] || '';
    document.getElementById('editPrice').value = app['Price'] || '';
    document.getElementById('editContentRating').value = app['Content Rating'] || '';
    document.getElementById('editDeveloperId').value = app['Developer Id'] || '';

    const permissionTypesResponse = await fetch(`${API_BASE_URL}/permissions/types`);
    let types;
    if (permissionTypesResponse.ok) {
        types = await permissionTypesResponse.json();
    } else {
        alert("Couldn't load permission types");
        return;
    }
    const permissionPairContainer = document.getElementById('permissionPairsContainerUpdate');
    permissionPairContainer.innerHTML = ''
    for (let permission of app.permissions) {
        const pair = document.createElement('div');
        pair.style.cssText = 'width: 100%; display: flex; align-items: center; justify-content: center;';

        const permissionTypeSelect = document.createElement('select');
        permissionTypeSelect.style.cssText = 'flex: 0.3; width: 100%;';
        for (let type of types) {
            const option = new Option(type, type);
            permissionTypeSelect.append(option);
        }
        permissionTypeSelect.value = permission['type'];

        const permissionDescriptionInput = document.createElement('input');
        permissionDescriptionInput.type = 'text';
        permissionDescriptionInput.value = permission['permission'];
        permissionDescriptionInput.placeholder = 'Permission description';
        permissionDescriptionInput.style.cssText = 'flex: 0.7; width: 100%;';

        const removeBtn = document.createElement('input');
        removeBtn.type = 'button';
        removeBtn.value = '❌';
        removeBtn.style.cssText = 'box-sizing: border-box;';
        removeBtn.onclick= (ev) => { permissionPairContainer.removeChild(pair) };

        pair.append(permissionTypeSelect, permissionDescriptionInput, removeBtn);

        permissionPairContainer.append(pair);
    }

    document.getElementById('editModal').classList.add('active');
}

async function handleEdit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const appId = formData.get('appId');
    const appName = formData.get('appName');
    formData.delete('appId');

    const updateData = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    if (updateData.Rating) updateData.Rating = parseFloat(updateData.Rating);
    if (updateData.Price) updateData.Price = parseFloat(updateData.Price);

    showMessage('editMessage', 'Updating app...', 'info');

    try {
        let response = await fetch(`${API_BASE_URL}/apps/update?appId=${encodeURIComponent(appId)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            showMessage('editMessage', 'App updated successfully!', 'success');
            setTimeout(() => {
                closeEditModal();
                loadManageData(); // Refresh the manage data
            }, 1500);
        } else {
            showMessage('editMessage', 'Update failed. Please try again.', 'error');
            return;
        }
        const allPermissions = [];
        const permissionsPairs = document.getElementById("permissionPairsContainerUpdate");
        for (let pair of permissionsPairs.children) {
            const select = pair.getElementsByTagName('select')[0];
            const permissionDescription = pair.getElementsByTagName('input')[0];
            const tmpJson = {
                permission: permissionDescription.value,
                type: select.value
            };
            allPermissions.push(tmpJson);
        }
        const permissionObj = {
          allPermissions: allPermissions
        };
        response = await fetch(`${API_BASE_URL}/permissions/update?appId=${encodeURIComponent(appId)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(permissionObj)
        });
    } catch (error) {
        showMessage('editMessage', 'Network error. Please try again.', 'error');
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editMessage').innerHTML = '';
}

// DELETE FUNCTIONALITY
async function deleteApp(appId) {
    if (!confirm(`Are you sure you want to delete the app with ID: ${appId}?`)) {
        return;
    }

    showMessage('manageMessage', 'Deleting app...', 'info');

    try {
        const response = await fetch(`${API_BASE_URL}/apps/delete?appId=${encodeURIComponent(appId)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('manageMessage', 'App deleted successfully!', 'success');
            loadManageData(); // Refresh the data
        } else {
            showMessage('manageMessage', 'Delete failed. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('manageMessage', 'Network error. Please try again.', 'error');
    }
}

// UTILITY FUNCTIONS
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.innerHTML = '';
        }, 3000);
    }
}

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

// Handle Enter key in search input
document.getElementById('manageSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadManageData();
    }
});

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
});

function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show correct panel
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tabName}-panel`).classList.add('active');
}

async function addPermissionPair() {
    const permissionTypesResponse = await fetch(`${API_BASE_URL}/permissions/types`);
    let types;
    if (permissionTypesResponse.ok) {
        types = await permissionTypesResponse.json();
    } else {
        alert("Couldn't load permission types");
        return;
    }

    const permissionPairContainer = document.getElementById('permissionPairsContainer');
    const pair = document.createElement('div');
    pair.style.cssText = 'width: 100%; display: flex; align-items: center; justify-content: center;';

    const permissionTypeSelect = document.createElement('select');
    permissionTypeSelect.style.cssText = 'flex: 0.3; width: 100%;';
    for (let type of types) {
        const option = new Option(type, type);
        permissionTypeSelect.append(option);
    }

    const permissionDescriptionInput = document.createElement('input');
    permissionDescriptionInput.type = 'text';
    permissionDescriptionInput.placeholder = 'Permission description';
    permissionDescriptionInput.style.cssText = 'flex: 0.7; width: 100%;';

    const removeBtn = document.createElement('input');
    removeBtn.type = 'button';
    removeBtn.value = '❌';
    removeBtn.style.cssText = 'box-sizing: border-box;';
    removeBtn.onclick= (ev) => { permissionPairContainer.removeChild(pair) };

    pair.append(permissionTypeSelect, permissionDescriptionInput, removeBtn);

    permissionPairContainer.append(pair);
}

async function addPermissionPairUpdate() {
    const permissionTypesResponse = await fetch(`${API_BASE_URL}/permissions/types`);
    let types;
    if (permissionTypesResponse.ok) {
        types = await permissionTypesResponse.json();
    } else {
        alert("Couldn't load permission types");
        return;
    }

    const permissionPairContainer = document.getElementById('permissionPairsContainerUpdate');
    const pair = document.createElement('div');
    pair.style.cssText = 'width: 100%; display: flex; align-items: center; justify-content: center;';

    const permissionTypeSelect = document.createElement('select');
    permissionTypeSelect.style.cssText = 'flex: 0.3; width: 100%;';
    for (let type of types) {
        const option = new Option(type, type);
        permissionTypeSelect.append(option);
    }

    const permissionDescriptionInput = document.createElement('input');
    permissionDescriptionInput.type = 'text';
    permissionDescriptionInput.placeholder = 'Permission description';
    permissionDescriptionInput.style.cssText = 'flex: 0.7; width: 100%;';

    const removeBtn = document.createElement('input');
    removeBtn.type = 'button';
    removeBtn.value = '❌';
    removeBtn.style.cssText = 'box-sizing: border-box;';
    removeBtn.onclick= (ev) => { permissionPairContainer.removeChild(pair) };

    pair.append(permissionTypeSelect, permissionDescriptionInput, removeBtn);

    permissionPairContainer.append(pair);
}