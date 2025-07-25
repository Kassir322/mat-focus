/**
 * Получает заголовки для серверных запросов к API
 * Использует API ключ вместо токена авторизации
 * @returns {Object} Объект с заголовками
 */
function getServerHeaders() {
	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
	}
}

/**
 * Получает все товары (серверная версия)
 * Используется для generateStaticParams и других серверных функций
 * @returns {Promise<Array>} Массив товаров
 */
export async function getAllProductsServer() {
	const res = await fetch(
		`${process.env.STRAPI_API_URL}/api/study-cards?populate=*`,
		{
			headers: getServerHeaders(),
			cache: 'force-cache',
		}
	)

	if (!res.ok) {
		return []
	}

	const data = await res.json()
	return data.data.map(transformStrapiResponse)
}

/**
 * Получает товар по slug (серверная версия)
 * @param {string} slug - Slug товара
 * @returns {Promise<Object|null>} Данные товара или null
 */
export async function getProductBySlugServer(slug) {
	// /api/study-cards?populate=*&filters[category][slug][$eq]=${categorySlug}
	const fetchUrl = `${process.env.STRAPI_API_URL}/api/study-cards?populate=*&filters[slug]=${slug}`
	const res = await fetch(fetchUrl, {
		headers: getServerHeaders(),
		// cache: 'force-cache',
		next: {
			revalidate: 20,
		},
	})

	if (!res.ok) {
		throw new Error('Ошибка при получении товара')
	}

	const data = await res.json()
	// console.log(`next-api data`, data)
	return data.data[0] ? transformStrapiResponse(data.data[0]) : null
}

/**
 * Получает все категории (серверная версия)
 * @returns {Promise<Array>} Массив категорий
 */
export async function getAllCategoriesServer() {
	const res = await fetch(
		`${process.env.STRAPI_API_URL}/api/categories?populate=*`,
		{
			headers: getServerHeaders(),
			cache: 'force-cache',
			next: {
				revalidate: 20, // Кэшируем на 1 час
				tags: ['categories'], // Добавляем тег для ревалидации
			},
		}
	)

	if (!res.ok) {
		return []
	}

	const data = await res.json()
	return data.data.map(transformCategoryResponse)
}

export async function getProductPrice(productId) {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/api/study-cards/${productId}?fields[0]=price&fields[1]=old_price`,
		{
			headers: getServerHeaders(),
		}
	)

	const data = await response.json()

	if (!response.ok) {
		throw new Error(JSON.stringify(data.error) || 'Failed to fetch price')
	}

	return {
		price: data.data.price,
		old_price: data.data.old_price,
		timestamp: new Date().toISOString(),
	}
}

/**
 * Трансформирует ответ от Strapi в формат, ожидаемый фронтендом
 */
function transformStrapiResponse(strapiItem) {
	const {
		id,
		title,
		description,
		price,
		quantity,
		number_of_cards,
		subject,
		card_type,
		is_active,
		slug,
		image,
		category,
		grades,
		article,
	} = strapiItem

	const obj = {
		id,
		title,
		description,
		price: Number(price),
		quantity: quantity || 0,
		numberOfCards: number_of_cards,
		subject,
		cardType: card_type,
		isActive: is_active,
		slug,
		images:
			image?.data?.map((img) => ({
				url: img.url,
				alt: img.alternativeText || title,
			})) || [],
		category: category
			? {
					name: category.name,
					slug: category.slug,
			  }
			: null,
		// grade: grade ? grade.name : null,
		grades:
			grades?.map((grade) => ({
				displayName: grade.display_name,
			})) || [],
		article: article,
	}

	return obj
}

/**
 * Трансформирует ответ категории от Strapi
 */
function transformCategoryResponse(categoryItem) {
	const { id, name, slug, description, is_active } = categoryItem

	return {
		id,
		name,
		slug,
		description,
		isActive: is_active,
	}
}

export async function getGradesWithCardsServer() {
	const res = await fetch(
		`${process.env.STRAPI_API_URL}/api/grades?populate=study_cards&sort=order:asc`,
		{
			headers: getServerHeaders(),
			cache: 'force-cache',
			next: {
				revalidate: 20, // Кэшируем на 1 час
				tags: ['grades'], // Добавляем тег для ревалидации
			},
		}
	)

	if (!res.ok) {
		return []
	}

	const data = await res.json()
	// Фильтруем только те классы, у которых есть связанные карточки
	return data.data.filter((grade) => grade.study_cards.length > 0)
}
