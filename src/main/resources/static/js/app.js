let currentUserRoles = [];

// Get current user roles and hide Add button if not MANAGER/ADMIN
fetch('/current-user', { credentials: 'include' })
    .then(res => res.json())
    .then(user => {
        currentUserRoles = user.roles;
        const addBtn = document.getElementById('addEmployeeBtn');
        if (!currentUserRoles.includes('ROLE_MANAGER') && !currentUserRoles.includes('ROLE_ADMIN')) {
            addBtn.style.display = 'none';
        }
    });

// Populate employee table
function loadEmployees() {
    fetch('/employees', { credentials: 'include' })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = "/login.html";
                }
                throw new Error("HTTP " + response.status);
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('employeesTableBody');
            tbody.innerHTML = '';
            const employees = data._embedded?.employees || [];
            if (employees.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="color:red;">No employees found</td></tr>';
                return;
            }
            employees.forEach(e => {
                const id = e._links.self.href.split('/').pop();

                // Profile picture or default
                const picSrc = e.profilePic
                    ? `data:image/png;base64,${e.profilePic}`
                    : '/images/default-profile.png';

                let row = `<tr>
                    <td><img src="${picSrc}" alt="Profile Pic" style="width:50px;height:50px;border-radius:50%;"></td>
                    <td>${e.firstName}</td>
                    <td>${e.lastName}</td>
                    <td>${e.email}</td>
                    <td>`;

                if (currentUserRoles.includes('ROLE_MANAGER') || currentUserRoles.includes('ROLE_ADMIN')) {
                    row += `<button class="updateBtn" data-id="${id}" data-first="${e.firstName}" data-last="${e.lastName}" data-email="${e.email}">Update</button>`;
                }

                if (currentUserRoles.includes('ROLE_ADMIN')) {
                    row += `<button class="deleteBtn" data-id="${id}">Delete</button>`;
                }

                row += `</td></tr>`;
                tbody.innerHTML += row;
            });
        })
        .catch(err => {
            document.getElementById('employeesTableBody').innerHTML =
                '<tr><td colspan="5" style="color:red;">Failed to load employees – you may not be logged in</td></tr>';
            console.error(err);
        });
}

loadEmployees();

// Add Employee Modal
document.getElementById('addEmployeeBtn').addEventListener('click', () => {
    document.getElementById('addEmployeeModal').style.display = 'block';
});
document.getElementById('cancelAdd').addEventListener('click', () => {
    document.getElementById('addEmployeeModal').style.display = 'none';
});

// Add Employee Form
document.getElementById('addEmployeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    fetch('/employees/add', {
        method: 'POST',
        credentials: 'include',
        body: formData
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to add employee: " + res.status);
            return res.json();
        })
        .then(data => {
            alert('Employee added!');
            document.getElementById('addEmployeeModal').style.display = 'none';
            this.reset();
            loadEmployees();
        })
        .catch(err => {
            console.error(err);
            alert('Error adding employee.');
        });
});

// Update Employee Modal
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('updateBtn')) {
        const btn = e.target;
        document.getElementById('updateId').value = btn.dataset.id;
        document.getElementById('updateFirst').value = btn.dataset.first;
        document.getElementById('updateLast').value = btn.dataset.last;
        document.getElementById('updateEmail').value = btn.dataset.email;

        // NEW: Reset profile pic input
        document.getElementById('updateProfilePic').value = '';

        document.getElementById('updateEmployeeModal').style.display = 'block';
    }
});
document.getElementById('cancelUpdate').addEventListener('click', () => {
    document.getElementById('updateEmployeeModal').style.display = 'none';
});
document.getElementById('updateEmployeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('updateId').value;
    const formData = new FormData();
    formData.append("firstName", document.getElementById('updateFirst').value);
    formData.append("lastName", document.getElementById('updateLast').value);
    formData.append("email", document.getElementById('updateEmail').value);

    const profilePicFile = document.getElementById('updateProfilePic').files[0];
    if (profilePicFile) formData.append("profilePic", profilePicFile);

    fetch(`/employees/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
    })

        .then(res => {
            if (!res.ok) throw new Error("Failed to update employee: " + res.status);
            return res.json();
        })
        .then(data => {
            alert('Employee updated!');
            document.getElementById('updateEmployeeModal').style.display = 'none';
            loadEmployees();
        })
        .catch(err => {
            console.error(err);
            alert('Error updating employee.');
        });
});

// Delete Employee
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('deleteBtn')) {
        // Only proceed if current user is admin
        if (!currentUserRoles.includes('ROLE_ADMIN')) {
            alert("You do not have permission to delete employees.");
            return;
        }

        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this employee?')) {
            fetch(`/employees/${id}`, {
                method: 'DELETE',
                credentials: 'include' // ensures session/cookies are sent
            })
                .then(res => {
                    if (!res.ok) throw new Error("Failed to delete employee: " + res.status);
                    alert('Employee deleted!');
                    loadEmployees();
                })
                .catch(err => {
                    console.error(err);
                    alert('Error deleting employee. You may not have permission.');
                });
        }
    }
});
