let membersData = []; // Store fetched data here
let selectedRows = [];
let currentPage = 1;
const itemsPerPage = 10;

// Fetch data from the API
async function fetchData() {
    try {
        const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
        const data = await response.json();
        membersData = data;
        renderTable();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


function renderTable() {
    const table = document.getElementById('dataTable');
    table.innerHTML = ''; // Clear previous table content
    // Pagination logic based on search results
    const filteredData = applySearchFilter(); // Implement this function for filtering
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Handle current page based on total pages and current page state
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = filteredData.slice(startIndex, endIndex);

    // Render table header
    const headerRow = table.insertRow();
    headerRow.innerHTML = `
      <th><input type="checkbox" onclick="selectAll(this)"></th>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
      <th>Actions</th>
    `;
    

    // Render table rows
    currentItems.forEach(item => {
        const row = table.insertRow();
        row.innerHTML = `
        <td><input type="checkbox" onclick="selectRow('${item.id}')" ${selectedRows.includes(item.id) ? 'checked' : ''}></td>
        <td>${item.name}</td>
        <td>${item.email}</td>
        <td>${item.role}</td>
        <td>
          <button class="edit" onclick="editRow('${item.id}')"><span class="material-symbols-outlined">
          edit
          </span></button>
          <button class="delete" onclick="deleteRow('${item.id}')"><span class="material-symbols-outlined">
          delete
          </span></button>
        </td>
      `;

        // Highlight selected rows
        if (selectedRows.includes(item.id)) {
            row.classList.add('selected');
        }
    });

    

    // Update pagination info
    const existingPagination = document.querySelector('.pagination-buttons');
    if (existingPagination) {
        existingPagination.remove();
    }

    const selectedRowsInfo = document.getElementById('selectedRowsInfo');
    selectedRowsInfo.textContent = `${selectedRows.length} of ${totalItems} row(s) selected`;

    const paginationInfo = document.getElementById('paginationInfo');
    paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Add pagination buttons dynamically
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-buttons');

    const firstPageButton = createPaginationButton('<<', 1);
    paginationContainer.appendChild(firstPageButton);

    const prevPageButton = createPaginationButton('<', currentPage - 1);
    paginationContainer.appendChild(prevPageButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i, i);
        paginationContainer.appendChild(pageButton);
    }

    const nextPageButton = createPaginationButton('>', currentPage + 1);
    paginationContainer.appendChild(nextPageButton);

    const lastPageButton = createPaginationButton('>>', totalPages);
    paginationContainer.appendChild(lastPageButton);

    const infoDiv = document.querySelector('.info');
    infoDiv.appendChild(paginationContainer);
}

function createPaginationButton(text, pageNum) {
    const button = document.createElement('button');
    button.textContent = text;

    if (pageNum === '<<' || pageNum === '>>' || pageNum === '<' || pageNum === '>') {
        button.classList.add('special');
    } else {
        button.classList.add('page');
    }

    button.addEventListener('click', () => {
        if (pageNum !== currentPage && pageNum !== '<<' && pageNum !== '>>' && pageNum !== '<' && pageNum !== '>') {
            goToPage(pageNum);
            console.log(goToPage)
        }
    });

    return button;
}


function goToPage(pageNumber) {
    const totalPages = calculateTotalPages();

    if (pageNumber < 1) {
        pageNumber = 1;
    } else if (pageNumber > totalPages) {
        pageNumber = totalPages;
    }

    currentPage = pageNumber; // Update the currentPage variable
    renderTable(); // Re-render the table with the updated page number
}

function calculateTotalPages() {
    const filteredData = applySearchFilter(); // Apply the search filter
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage); // Use itemsPerPage from renderTable function

    return totalPages;
}



function selectRow(rowId) {
    const index = selectedRows.indexOf(rowId);
    if (index === -1) {
        selectedRows.push(rowId);
    } else {
        selectedRows.splice(index, 1);
    }

    renderTable();
}

function search() {
    renderTable();
}


function selectAll(checkbox) {
    const checkboxes = document.querySelectorAll('#dataTable input[type="checkbox"]');
    selectedRows = []; // Clear selectedRows array

    checkboxes.forEach(check => {
        check.checked = checkbox.checked;
        const rowId = check.parentElement.parentElement.cells[1].textContent;
        if (checkbox.checked && rowId !== 'Name') {
            selectedRows.push(rowId);
        }
    });
    console.log(selectedRows)

    renderTable();
}




function editRow(rowId) {
    const modal = document.querySelector('.modal');
    
    const overlay = document.querySelector('.overlay');
    const rowData = membersData.find(item => item.id === rowId);
    console.log(rowData);
  
    // Populate the modal with the row data 
    modal.innerHTML = `
      <div class="modal-header">
        <h3>Edit Row</h3>
        <button class="btn-close">⨉</button>
      </div>
      <div class="modal-body">
        <form id="edit-form">
          <label for="name">Name:</label>
          <input type="text" id="name" value="${rowData.name}">
          <label for="email">Email:</label>
          <input type="email" id="email" value="${rowData.email}">
          <label for="role">Role:</label>
          <input type="text" id="role" value="${rowData.role}">
          <button type="submit" class="btn">Submit</button>
        </form>
      </div>
    `;
  
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
  
    const closeButton = document.querySelector('.btn-close');
    const editForm = document.querySelector('#edit-form');
  
    closeButton.addEventListener('click', () => {
      modal.classList.add('hidden');
      overlay.classList.add('hidden');
    });
  
    editForm.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const newName = editForm.querySelector('#name').value;
      const newEmail = editForm.querySelector('#email').value;
      const newRole = editForm.querySelector('#role').value;
  
      rowData.name = newName;
      rowData.email = newEmail;
      rowData.role = newRole;
  
      modal.classList.add('hidden');
      overlay.classList.add('hidden');
  
      renderTable();
    });
  }
  

function deleteRow(rowId) {
    const index = membersData.findIndex(member => member.id === rowId);
    if (index !== -1) {
        membersData.splice(index, 1); // Remove the row from the data
    }
    selectedRows = selectedRows.filter(selectedId => selectedId !== rowId); // Remove from selected rows if selected

    renderTable(); // Update table after deletion
}

// Function to apply search filter on data
function applySearchFilter() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    if (searchInput.trim() === '') {
        return membersData;
    } else {
        return membersData.filter(member =>
            member.name.toLowerCase().includes(searchInput) ||
            member.email.toLowerCase().includes(searchInput) ||
            member.role.toLowerCase().includes(searchInput)
        );
    }
}


// Delete selected rows
function deleteSelected() {
    // Remove selected rows from membersData
    selectedRows.forEach(rowId => {
        const index = membersData.findIndex(member => member.id === rowId);
        if (index !== -1) {
            membersData.splice(index, 1);
        }
    });

    // Clear the selectedRows array
    selectedRows = [];

    // Re-render the table
    renderTable();
}

// Handle row selection
function selectRow(rowId) {
    const index = selectedRows.indexOf(rowId);
    if (index === -1) {
        selectedRows.push(rowId); // If not already selected, add to selectedRows array
    } else {
        selectedRows.splice(index, 1); // If already selected, remove from selectedRows array
    }

    // Re-render the table
    renderTable();
}

// Initialize the application
fetchData();