import { useState, useEffect } from 'react';

/**
 * Hook tùy chỉnh để debounce (trì hoãn) một giá trị.
 * * Giá trị đầu ra (debouncedValue) sẽ chỉ được cập nhật sau khi
 * giá trị đầu vào (value) không thay đổi trong một khoảng thời gian nhất định (delay).
 *
 * @param {any} value Giá trị cần debounce (ví dụ: chuỗi tìm kiếm của người dùng).
 * @param {number} delay Thời gian trì hoãn tính bằng mili giây (ví dụ: 500ms).
 * @returns {any} Giá trị đã được debounce.
 */
const useDebounce = (value, delay) => {
    // State lưu trữ giá trị đã được debounce (trì hoãn)
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Thiết lập hẹn giờ (timer) để cập nhật debouncedValue sau thời gian delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Hàm dọn dẹp: Hủy hẹn giờ trước khi useEffect chạy lần tiếp theo hoặc component unmount
        // Điều này đảm bảo rằng chúng ta chỉ cập nhật debouncedValue SAU KHI người dùng dừng gõ.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Chỉ chạy lại khi 'value' hoặc 'delay' thay đổi

    return debouncedValue;
};

export default useDebounce;