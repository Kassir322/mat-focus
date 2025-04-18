export default function MyButton({ children, href, className, type = null }) {
	// 	const buttonClasses = `
	// 	${baseClasses}
	// 	${variantClasses[variant]}
	// 	${sizeClasses[size]}
	// 	${stateClasses.loading}
	// 	${stateClasses.disabled}
	// 	${className}
	// `.trim()
	return (
		<button
			type={type}
			className={`${className} bg-dark rounded-md inline-flex items-center justify-center py-3 px-7 text-center 2xl:text-base xl:text-sm font-medium text-white hover:bg-hover disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 hover:cursor-pointer transition-colors`}
		>
			{children}
		</button>
	)
}
