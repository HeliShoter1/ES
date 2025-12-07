import React, { useEffect, useState } from "react";
import { Button } from 'primereact/button';

export default function Slide() {

    const [first, setFirst] = useState<number>(1);

    const onPageIncrease = () => {
        setFirst(prev => prev === 5 ? 1 : prev + 1);
    };

    const onPageDecrease = () => {
        setFirst(prev => prev === 1 ? 5 : prev - 1);
    };

    // ⭐ Tự động chạy mỗi 5 giây
    useEffect(() => {
        const timer = setInterval(() => {
            setFirst(prev => prev === 5 ? 1 : prev + 1);
        }, 5000);

        return () => clearInterval(timer); // Cleanup khi unmount
    }, [first]);

    return (
        <div 
            className="slide-wrapper"
            style={{
                width: "100%",
                height: "700px",   // 👈 KHUNG CỐ ĐỊNH
                position: "relative",
                borderRadius: "20px",
                overflow: "hidden", // 👈 QUAN TRỌNG để không bị lòi hình ra ngoài
                margin: "30px auto"
              }}
        >

            <Button
                icon="pi pi-chevron-left"
                rounded
                text
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "10px",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0,0,0,0.0)",
                    color: "white"
                }}
                onClick={onPageDecrease}
            />

            <Button
                icon="pi pi-chevron-right"
                rounded
                text
                style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    color: "white"
                }}
                onClick={onPageIncrease}
            />

            <img
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    borderRadius: "20px"
                }}
                alt={first.toString()}
                src={`/images/img_slider_${first}.png`}
            />
        </div>
    );
}
