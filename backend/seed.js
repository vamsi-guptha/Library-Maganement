const store = require('./data/store');

const seedData = async () => {
  try {
    const users = store.get('users');
    if (users.length > 0) {
      console.log('Database already seeded');
      return;
    }

    store.create('users', { name: 'Admin User', email: 'admin@library.com', password: 'password123', role: 'Administrator' });
    store.create('users', { name: 'Student John', email: 'student@library.com', password: 'password123', role: 'Student' });

    const initialBooks = [
      { book_id: 'B-101', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', availability_status: 'Available', shelf_location: 'CS-101' },
      { book_id: 'B-102', title: 'Clean Code', author: 'Robert C. Martin', availability_status: 'Issued', shelf_location: 'CS-102' },
      { book_id: 'B-103', title: 'Design Patterns', author: 'Erich Gamma', availability_status: 'Available', shelf_location: 'CS-103' },
      { book_id: 'B-104', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', availability_status: 'Available', shelf_location: 'CS-104' },
      { book_id: 'B-105', title: 'Database System Concepts', author: 'Abraham Silberschatz', availability_status: 'Available', shelf_location: 'CS-105' }
    ];
    
    initialBooks.forEach(b => store.create('books', b));

    // Seed visual grid of seats
    // Floor 1, Section A (5x5 grid with some gaps)
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        // Skip the center to make it look like an aisle or irregular classroom
        if (r === 2 && c === 2) continue;
        
        let status = 'Available';
        if ((r + c) % 3 === 0) status = 'Occupied';
        if (r === 1 && c === 1) status = 'Reserved';

        store.create('seats', { floor: 1, section: 'A', gridRow: r, gridCol: c, status });
      }
    }

    // Floor 2, Quiet Zone (3x4 grid)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        let status = 'Available';
        if (r === 0) status = 'Occupied';
        store.create('seats', { floor: 2, section: 'Quiet Zone', gridRow: r, gridCol: c, status });
      }
    }

    console.log('Mock Data Seeded Successfully');
  } catch (error) {
    console.error(`Seed Error: ${error.message}`);
  }
};

module.exports = seedData;
