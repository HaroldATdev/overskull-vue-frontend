import { createPinia } from 'pinia'

/**
 * Instancia única de Pinia.
 *
 * Se exporta para poder usarla también fuera de los componentes (por ejemplo
 * en los interceptores de Axios, que necesitan las stores de carga y toasts).
 */
export const pinia = createPinia()

export default pinia