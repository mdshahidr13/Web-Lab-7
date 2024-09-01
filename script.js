const baseURL = "https://openlibrary.org/search.json?subject=poetry&language=urd";
let booklist = [];
let filteredBooks = [];
let currentPage = 1;
const itemsPerPage = 5;

window.onload = () => {
    const fetchButton = document.getElementById("fetchButton");
    const searchInput = document.getElementById("search");
    const sortSelect = document.getElementById("sort");

    fetchButton.addEventListener('click', fetchBooks);
    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
};

async function fetchBooks() {
    document.getElementById("loading").style.display = "block";
    document.getElementById("booklist").innerHTML = '';

    try {
        const response = await fetch(baseURL);
        const data = await response.json();
        booklist = data.docs;
        filteredBooks = booklist;
        displayBooks();
        setupPagination();
    } catch (error) {
        console.error("Error fetching books:", error);
        document.getElementById("booklist").innerHTML = `<p>Error fetching books. Please try again later.</p>`;
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

function displayBooks() {
    const bookListContainer = document.getElementById("booklist");
    bookListContainer.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const booksToDisplay = filteredBooks.slice(start, end);

    booksToDisplay.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = "single-book";

        const bookImg = document.createElement('img');
        bookImg.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` || 'placeholder.jpg';
        bookImg.alt = book.title;
        bookImg.className = "book-image";

        const bookInfo = document.createElement('div');
        bookInfo.className = "book-info";

        const bookTitle = document.createElement('div');
        bookTitle.className = "book-title";
        bookTitle.textContent = book.title;

        const bookAuthor = document.createElement('div');
        bookAuthor.className = "book-author";
        bookAuthor.textContent = book.author_name ? book.author_name.join(', ') : 'Unknown Author';

        const bookDesc = document.createElement('div');
        bookDesc.className = "book-desc";
        bookDesc.textContent = book.first_publish_year ? `First published in ${book.first_publish_year}` : 'Publication year not available';

        bookInfo.appendChild(bookTitle);
        bookInfo.appendChild(bookAuthor);
        bookInfo.appendChild(bookDesc);
        bookElement.appendChild(bookImg);
        bookElement.appendChild(bookInfo);

        bookListContainer.appendChild(bookElement);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const sortBy = document.getElementById("sort").value;

    filteredBooks = booklist.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        (book.author_name && book.author_name.join(', ').toLowerCase().includes(searchTerm))
    );

    filteredBooks.sort((a, b) => {
        if (sortBy === "title") {
            return a.title.localeCompare(b.title);
        } else if (sortBy === "author") {
            return (a.author_name && a.author_name[0] ? a.author_name[0] : '').localeCompare(b.author_name && b.author_name[0] ? b.author_name[0] : '');
        }
    });

    currentPage = 1;
    displayBooks();
    setupPagination();
}

function setupPagination() {
    const pageCount = Math.ceil(filteredBooks.length / itemsPerPage);
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = (i === currentPage) ? "active" : "";
        button.addEventListener("click", () => {
            currentPage = i;
            displayBooks();
            setupPagination(); // Update the pagination after a new page is selected
        });
        paginationContainer.appendChild(button);
    }
}

