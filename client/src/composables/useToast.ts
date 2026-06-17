import { ref } from 'vue'

type ToastType = 'success' | 'error'

interface Toast {
    id: number
    message: { html: string } | string
    type: ToastType
}

const toasts = ref<Toast[]>([])

let nextId = 0
export function useToast() {
    function add(
        message: { html: string } | string,
        type: ToastType = 'success',
        duration: number | false = 3000,
    ) {
        const id = nextId++
        toasts.value.push({ id, message, type })
        if (typeof duration === 'number') setTimeout(() => dismiss(id), duration)
    }

    function dismiss(id: number) {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    return { toasts, add, dismiss }
}
