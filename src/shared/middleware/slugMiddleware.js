const slugify = require('slugify');
module.exports = function slugMiddleware(schema) {
  schema.pre('save', async function (next) {
    if (!this.isModified('name')) return next();

    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;

    // check if slug already exists in the db
    while (await this.constructor.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
    next();
  });
};
