async function verifyUsersApi() {
    const baseUrl = 'http://localhost:3001/users';
    const timestamp = Date.now();
    const newUser = {
        email: `testuser_${timestamp}@example.com`,
        password: 'password123',
        fullName: 'Test User',
    };

    console.log('--- Starting Verification ---');

    // 1. Create User
    console.log('\nCreating User...');
    const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
    });

    if (!createRes.ok) {
        const error = await createRes.text();
        console.error(`Failed to create user: ${createRes.status} ${error}`);
        return;
    }

    const createdUser = await createRes.json();
    console.log('User Created:', createdUser);

    if (createdUser.passwordHash) {
        console.error('ERROR: Password hash returned in response!');
    }
    if (createdUser.email !== newUser.email) {
        console.error('ERROR: Email mismatch!');
    }

    const userId = createdUser.id;

    // 2. Get All Users
    console.log('\nGetting All Users...');
    const getAllRes = await fetch(baseUrl);
    const users = await getAllRes.json();
    console.log(`Found ${users.length} users.`);
    const foundUser = users.find((u: any) => u.id === userId);
    if (!foundUser) {
        console.error('ERROR: Created user not found in list!');
    }

    // 3. Get One User
    console.log(`\nGetting User ${userId}...`);
    const getOneRes = await fetch(`${baseUrl}/${userId}`);
    const fetchedUser = await getOneRes.json();
    console.log('User Fetched:', fetchedUser);
    if (fetchedUser.id !== userId) {
        console.error('ERROR: ID mismatch!');
    }

    // 4. Update User
    console.log('\nUpdating User...');
    const updateRes = await fetch(`${baseUrl}/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Updated Test User' }),
    });
    const updatedUser = await updateRes.json();
    console.log('User Updated:', updatedUser);
    if (updatedUser.fullName !== 'Updated Test User') {
        console.error('ERROR: Name update failed!');
    }

    // 5. Delete User
    console.log('\nDeleting User...');
    const deleteRes = await fetch(`${baseUrl}/${userId}`, {
        method: 'DELETE',
    });
    const deletedUser = await deleteRes.json();
    console.log('User Deleted:', deletedUser);

    // Verify deletion
    const checkDelete = await fetch(`${baseUrl}/${userId}`);
    if (checkDelete.status === 404) {
        console.log('Verification Successful: User not found after deletion.');
    } else {
        console.error('ERROR: User still exists after deletion!');
    }
}

verifyUsersApi().catch(console.error);
