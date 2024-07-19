const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint
  // find all tags
  // be sure to include its associated Product data
  router.get('/', async (req, res) => {
    try {
      // Find all tags and include associated Product data through ProductTag
      const tags = await Tag.findAll({
        include: [
          {
            model: Product,
            through: { attributes: [] }, // To exclude attributes from ProductTag
          },
        ],
      });
  
      // Respond with the tags JSON data including associated Product data
      res.json(tags);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve tags' });
    }
  });
  // find a single tag by its `id`
  // be sure to include its associated Product data
  router.get('/:id', async (req, res) => {
    const tagId = req.params.id; // Get tag id from route parameters
  
    try {
      // Find the tag by id and include associated Product data through ProductTag
      const tag = await Tag.findByPk(tagId, {
        include: [
          {
            model: Product,
            through: { attributes: [] }, // To exclude attributes from ProductTag
          },
        ],
      });
  
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
  
      // Respond with the tag JSON data including associated Product data
      res.json(tag);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve tag' });
    }
  });
// create a new tag
router.post('/', async (req, res) => {
  const { tag_name } = req.body; // Destructure tag_name from req.body

  try {
    // Create a new tag in the database
    const tag = await Tag.create({ tag_name });

    // Respond with the newly created tag JSON data
    res.status(201).json(tag);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create tag' });
  }
});

 // update a tag's name by its `id` value
 router.put('/:id', async (req, res) => {
  const tagId = req.params.id; // Get tag id from route parameters
  const { tag_name } = req.body; // Destructure tag_name from req.body

  try {
    // Find the tag by id and update its tag_name
    const [rowsUpdated] = await Tag.update(
      { tag_name },
      {
        where: { id: tagId },
      }
    );

    if (rowsUpdated === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Fetch the updated tag
    const updatedTag = await Tag.findByPk(tagId);

    // Respond with the updated tag JSON data
    res.json(updatedTag);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update tag' });
  }
});


// delete on tag by its `id` value
router.delete('/:id', async (req, res) => {
  const tagId = req.params.id; // Get tag id from route parameters

  try {
    // Find the tag by id
    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Delete associated ProductTag records first
    await ProductTag.destroy({ where: { tag_id: tagId } });

    // Then delete the tag itself
    await tag.destroy();

    // Respond with success message
    res.json({ message: 'Tag deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

module.exports = router;
