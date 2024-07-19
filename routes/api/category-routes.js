const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint
  // find all categories
  // be sure to include its associated Products
  router.get('/', async (req, res) => {
    try {
      const categories = await Category.findAll({
        include: {
          model: Product,
          attributes: ['id', 'product_name', 'price', 'stock'],
        },
      });
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  });
  
  router.get('/:id', async (req, res) => {
    const categoryId = req.params.id;
  
    try {
      const category = await Category.findByPk(categoryId, {
        include: {
          model: Product,
          attributes: ['id', 'product_name', 'price', 'stock'],
        },
      });
  
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      res.json(category);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve category' });
    }
  });


// create a new category
router.post('/', async (req, res) => {
  const { category_name, product_id } = req.body; // Extract category_name and product_id from request body

  try {
    // Create a new category in the database
    const newCategory = await Category.create({
      category_name,
      product_id,
    });

    // Respond with the newly created category JSON data
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});



// update a category by its `id` value
router.put('/:id', async (req, res) => {
  const categoryId = req.params.id; // Get category id from route parameters
  const { category_name, product_id } = req.body; // Extract updated data from request body

  try {
    // Find the category by id
    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update the category's fields
    category.category_name = category_name;
    category.product_id = product_id;

    // Save the updated category
    await category.save();

    // Respond with the updated category JSON data
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});


// delete a category by its `id` value
router.delete('/:id', async (req, res) => {
  const categoryId = req.params.id; // Get category id from route parameters

  try {
    // Find the category by id
    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete the category
    await category.destroy();

    // Respond with success message
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
