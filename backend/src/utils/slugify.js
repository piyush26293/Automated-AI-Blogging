const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const generateUniqueSlug = async (text, checkExists) => {
  let slug = slugify(text);
  let counter = 1;
  let originalSlug = slug;

  while (await checkExists(slug)) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = {
  slugify,
  generateUniqueSlug,
};
