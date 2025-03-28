import prisma from '@/lib/prisma';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  parentId: string | null;
  subcategories?: Category[];
}

function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // First pass: create map of all categories
  categories.forEach((category: Category) => {
    categoryMap.set(category.id, { ...category, subcategories: [] });
  });

  // Second pass: build tree structure
  categories.forEach(category => {
    const node = categoryMap.get(category.id);
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent && node) {
        parent.subcategories?.push(node);
      }
    } else if (node) {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

export default async function handler() {
  console.log('Fetching categories from database...');
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true,
    },
    where: {
      isActive: true,
    },
  });
  console.log('Raw categories data:', categories);

  const productCategories = categories.filter((category: Category) => {
    console.log('Product category check:', category.id, category.type);
    return category.type === 'PRODUCT';
  });
  const serviceCategories = categories.filter((category: Category) => {
    console.log('Service category check:', category.id, category.type);
    return category.type === 'SERVICE';
  });
  const newsCategories = categories.filter((category: Category) => {
    console.log('News category check:', category.id, category.type);
    return category.type === 'NEWS';
  });

  console.log('Product categories:', productCategories);
  console.log('Service categories:', serviceCategories);
  console.log('News categories:', newsCategories);

  const groupedCategories = {
    products: buildCategoryTree(productCategories),
    services: buildCategoryTree(serviceCategories),
    news: buildCategoryTree(newsCategories),
  };

  console.log('Final grouped categories:', groupedCategories);

  return Response.json(groupedCategories);
}