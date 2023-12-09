export function throttle(func, delay) {
    let throttling = false
    return function (...args) {
        if (!throttling) {
            func(...args)
            throttling = true
            setTimeout( () => throttling = false, delay)
        }
    }
}