const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
  // find all products
  // be sure to include its associated Category and Tag data
  router.get('/', async (req, res) => {
    try {
      // Find all products and include associated Category and Tag data
      const products = await Product.findAll({
        include: [
          { model: Category }, // Include the Category model
          { model: Tag, through: { attributes: [] } }, // Include the Tag model through ProductTag, with no additional attributes
        ],
      });
  
      // Respond with the products JSON data including associated Category and Tag data
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve products' });
    }
  });

// get one product
// find a single product by its `id`
  // be sure to include its associated Category and Tag data
  router.get('/:id', async (req, res) => {
    const productId = req.params.id; // Get product id from route parameters
  
    try {
      // Find the product by id and include associated Category and Tag data
      const product = await Product.findByPk(productId, {
        include: [
          { model: Category }, // Include the Category model
          { model: Tag, through: { attributes: [] } }, // Include the Tag model through ProductTag, with no additional attributes
        ],
      });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Respond with the product JSON data including associated Category and Tag data
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve product' });
    }
  });

// create new product
router.post('/', async (req, res) => {
  const { product_name, price, stock, tagIds } = req.body; // Destructure necessary fields from req.body

  try {
    // Create the product in the database
    const product = await Product.create({
      product_name,
      price,
      stock,
      category_id: req.body.category_id
    });

    // If there are tagIds provided, create associations in ProductTag model
    if (tagIds && tagIds.length > 0) {
      const productTagIdArr = tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));

      // Bulk create associations in ProductTag model
      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Respond with the newly created product JSON data
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create product', details: err });
  }
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});


  // delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  const productId = req.params.id; // Get product id from route parameters

  try {
    // Find the product by id
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated product tags first
    await ProductTag.destroy({ where: { product_id: productId } });

    // Then delete the product itself
    await product.destroy();

    // Respond with success message
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
