const slugify = require('slugify');

module.exports = function slugMiddleware(schema) {
  // pre-save hook
  schema.pre('save', async function (next) {
    if (!this.isModified('name') || !this.name) {
      this.slug = await generateUniqueSlug(this.constructor, 'untitled');
      return next();
    }

    this.slug = await generateUniqueSlug(this.constructor, this.name);
    next();
  });

  // pre-update hook
  schema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
    const update = this.getUpdate();
    if (!update.name) return next(); // Skip if no name in update

    update.slug = await generateUniqueSlug(this.model, update.name);
    this.setUpdate(update);
    next();
  });

  // generatin unique slug
  async function generateUniqueSlug(model, name) {
    const baseSlug = slugify(name, { lower: true, strict: true }) || 'untitled';
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await model.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
};
