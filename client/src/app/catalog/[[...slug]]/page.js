// src/app/catalog/[[...slug]]/page.js
import CatalogView from '@/components/catalog/CatalogView'
import { getSeoTextForCategory } from '@/lib/seo-helpers'
import {
	getProductsByCategory,
	getAllProducts,
	getAllCategories,
} from '@/lib/api'
import Breadcrumbs from '@/components/Breadcrumbs'

export async function generateMetadata({ params }) {
	const { slug } = await params
	const categorySlug = slug?.[0] || 'catalog'
	const seoText = getSeoTextForCategory(categorySlug)

	return {
		title: seoText.title,
		description: seoText.description,
	}
}

export default async function CatalogPage({ params, searchParams }) {
	const { slug } = await params

	// Получаем slug категории из URL или устанавливаем дефолтное значение
	const categorySlug = slug?.[0] || 'catalog'

	const search_Params = await searchParams

	// Получаем все категории и находим текущую
	const categories = await getAllCategories()
	const currentCategory = categories.find((cat) => cat.slug === categorySlug)

	// Получаем данные о категории и товарах
	const products =
		categorySlug === 'catalog'
			? await getAllProducts()
			: await getProductsByCategory(categorySlug)

	// Получаем SEO текст для данной категории
	const seoText = getSeoTextForCategory(categorySlug)

	// Формируем хлебные крошки
	const breadcrumbItems = [
		{ name: 'Главная', url: '/' },
		{ name: 'Каталог', url: '/catalog' },
	]

	if (categorySlug !== 'catalog' && currentCategory) {
		breadcrumbItems.push({
			name: currentCategory.name,
			url: `/catalog/${categorySlug}`,
		})
	}

	// Получаем параметры запроса для начальной фильтрации
	const initialSort = search_Params.sort || 'popular'
	const initialPage = parseInt(await search_Params.page) || 1

	return (
		<div className="container mx-auto px-4 mt-24 mb-16">
			{/* SEO блок с заголовком и описанием */}
			<section className="mb-8">
				<h1 className="text-3xl font-bold mb-4">{seoText.title}</h1>
				<div className="bg-white p-6 rounded-lg shadow-sm">
					<p className="text-gray-700">{seoText.description}</p>
				</div>
			</section>

			{/* Хлебные крошки */}
			<Breadcrumbs items={breadcrumbItems} />

			{/* Основной компонент каталога (клиентский) */}
			<CatalogView
				products={products}
				categories={categories}
				categorySlug={categorySlug}
				initialSort={initialSort}
				initialPage={initialPage}
			/>
		</div>
	)
}
