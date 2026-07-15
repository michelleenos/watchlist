import { ref } from 'vue'

const modalOpen = ref(false)
export function useModalOpen() {
    return { modalOpen }
}
