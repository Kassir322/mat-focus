'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import {
	selectIsAuthenticated,
	selectCurrentUser,
	selectIsLoading,
	selectAuthError,
	loginUser,
	logoutUser,
	registerUser,
	fetchCurrentUser,
	clearError,
	setAuth,
	clearAuth,
} from '@/store/slices/authSlice'
import cookiesService from '@/services/cookies'

/**
 * Кастомный хук для управления авторизацией
 * @returns {Object} Объект с методами и свойствами для управления авторизацией
 */
export function useAuth() {
	const dispatch = useDispatch()
	const router = useRouter()
	const { user, isAuthenticated, token } = useSelector((state) => state.auth)

	// Локальное состояние для обработки загрузки
	const [localLoading, setLocalLoading] = useState(false)
	const [initialized, setInitialized] = useState(false)

	// Проверяем авторизацию при загрузке компонента
	useEffect(() => {
		const checkAuth = async () => {
			try {
				if (!initialized) {
					setLocalLoading(true)
					// Проверяем наличие пользователя в localStorage
					const savedUser = localStorage.getItem('user')
					const authToken = cookiesService.getAuthToken()

					if (savedUser && authToken) {
						// Синхронизируем Redux состояние
						dispatch(
							setAuth({
								user: JSON.parse(savedUser),
								token: authToken,
							})
						)
					} else {
						// Сбрасываем состояние, если нет данных
						dispatch(clearAuth())
					}

					// После инициализации проверяем актуальность токена
					await dispatch(fetchCurrentUser()).unwrap()
					setInitialized(true)
				}
			} catch (error) {
				console.error('Ошибка при проверке авторизации:', error)
				dispatch(clearAuth())
			} finally {
				setLocalLoading(false)
			}
		}

		// Проверяем авторизацию
		checkAuth()
	}, [dispatch, initialized])

	/**
	 * Функция для входа пользователя
	 * @param {Object} credentials - Учетные данные пользователя
	 * @param {string} redirectUrl - URL для перенаправления после успешного входа
	 * @returns {Promise<void>}
	 */
	const login = useCallback(
		async (credentials, redirectUrl = '/account') => {
			try {
				setLocalLoading(true)
				await dispatch(loginUser(credentials)).unwrap()
				router.push(redirectUrl)
			} catch (error) {
				console.error('Ошибка при входе:', error)
			} finally {
				setLocalLoading(false)
			}
		},
		[dispatch, router]
	)

	/**
	 * Функция для регистрации пользователя
	 * @param {Object} userData - Данные пользователя
	 * @param {string} redirectUrl - URL для перенаправления после успешной регистрации
	 * @returns {Promise<void>}
	 */
	const register = useCallback(
		async (userData, redirectUrl = '/account/login?registered=true') => {
			try {
				setLocalLoading(true)
				await dispatch(registerUser(userData)).unwrap()
				router.push(redirectUrl)
			} catch (error) {
				console.error('Ошибка при регистрации:', error)
			} finally {
				setLocalLoading(false)
			}
		},
		[dispatch, router]
	)

	/**
	 * Функция для выхода пользователя из системы
	 * @param {string} redirectUrl - URL для перенаправления после выхода
	 * @returns {Promise<void>}
	 */
	const logout = useCallback(
		async (redirectUrl = '/') => {
			try {
				setLocalLoading(true)
				await dispatch(logoutUser()).unwrap()
				router.push(redirectUrl)
			} catch (error) {
				console.error('Ошибка при выходе:', error)
			} finally {
				setLocalLoading(false)
			}
		},
		[dispatch, router]
	)

	/**
	 * Функция для сброса ошибок авторизации
	 */
	const resetError = useCallback(() => {
		dispatch(clearError())
	}, [dispatch])

	return {
		user,
		isAuthenticated,
		token,
		isLoading: isAuthenticated === null || localLoading,
		error:
			isAuthenticated === null
				? null
				: isAuthenticated === false
				? 'Ошибка авторизации'
				: null,
		login,
		register,
		logout,
		resetError,
	}
}
