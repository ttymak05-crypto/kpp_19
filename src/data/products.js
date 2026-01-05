// Масив продуктів
let products = [
    {
        id: 1,
        name: "Планшет Samsung Galaxy Tab S9",
        description: "Потужний планшет з AMOLED-екраном 11 дюймів",
        price: 32000,
        category: "electronics",
        inStock: true,
        quantity: 18,
        createdBy: 1,
        createdAt: "2024-02-02T09:15:00Z"
    },
    {
        id: 2,
        name: "Розумний годинник Apple Watch Series 9",
        description: "Смарт-годинник з функціями здоровʼя та фітнесу",
        price: 21000,
        category: "electronics",
        inStock: true,
        quantity: 30,
        createdBy: 2,
        createdAt: "2024-02-03T10:40:00Z"
    },
    {
        id: 3,
        name: "Куртка зимова чоловіча",
        description: "Тепла куртка з водовідштовхувальним покриттям",
        price: 4500,
        category: "clothing",
        inStock: true,
        quantity: 22,
        createdBy: 1,
        createdAt: "2024-02-04T12:00:00Z"
    },
    {
        id: 4,
        name: "Книга 'React з нуля'",
        description: "Практичний посібник з розробки на React",
        price: 750,
        category: "books",
        inStock: true,
        quantity: 12,
        createdBy: 3,
        createdAt: "2024-02-05T14:30:00Z"
    },
    {
        id: 5,
        name: "Кавоварка DeLonghi Magnifica",
        description: "Автоматична кавоварка для еспресо та капучино",
        price: 28000,
        category: "home",
        inStock: false,
        quantity: 0,
        createdBy: 2,
        createdAt: "2024-02-06T16:45:00Z"
    }
];

// Функції для роботи з продуктами
const productModel = {
    // Отримати всі продукти
    getAll: (filters = {}) => {
        let filteredProducts = [...products];

        // Фільтрація по категорії
        if (filters.category) {
            filteredProducts = filteredProducts.filter(p => p.category === filters.category);
        }

        // Фільтрація по наявності
        if (filters.inStock !== undefined) {
            filteredProducts = filteredProducts.filter(p => p.inStock === (filters.inStock === 'true'));
        }

        // Пошук по назві або опису
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        // Сортування
        if (filters.sort) {
            switch (filters.sort) {
                case 'price_asc':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'oldest':
                    filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
            }
        }

        // Пагінація
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        return {
            products: paginatedProducts,
            total: filteredProducts.length,
            page,
            totalPages: Math.ceil(filteredProducts.length / limit),
            hasNextPage: endIndex < filteredProducts.length,
            hasPrevPage: startIndex > 0
        };
    },

    // Знайти продукт по ID
    findById: (id) => {
        return products.find(p => p.id === parseInt(id));
    },

    // Додати новий продукт
    create: (productData) => {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

        const newProduct = {
            id: newId,
            ...productData,
            createdAt: new Date().toISOString()
        };

        products.push(newProduct);
        return newProduct;
    },

    // Оновити продукт
    update: (id, productData) => {
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index === -1) return null;

        products[index] = { ...products[index], ...productData };
        return products[index];
    },

    // Видалити продукт
    delete: (id) => {
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index === -1) return false;

        products.splice(index, 1);
        return true;
    },

    // Отримати продукти користувача
    getByUser: (userId) => {
        return products.filter(p => p.createdBy === parseInt(userId));
    }
};

module.exports = productModel;
