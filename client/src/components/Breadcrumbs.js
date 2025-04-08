// src/components/Breadcrumbs.js
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import SchemaOrg from '@/components/SchemaOrg'

export default function Breadcrumbs({ items }) {
	// Формируем структуру данных для Schema.org
	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	}

	return (
		<>
			<nav
				className="flex items-center text-sm text-gray-500 mb-6"
				aria-label="Breadcrumb"
			>
				<ol className="flex items-center flex-wrap">
					{items.map((item, index) => (
						<li key={index} className="flex items-center">
							{index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
							{index === items.length - 1 ? (
								<span className="font-medium text-gray-900">{item.name}</span>
							) : (
								<Link
									href={item.url}
									className="hover:text-primary transition-colors"
								>
									{item.name}
								</Link>
							)}
						</li>
					))}
				</ol>
			</nav>
			<SchemaOrg data={schemaData} />
		</>
	)
}
