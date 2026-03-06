import { Link } from "@inertiajs/react";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header({ settings }) {

    const headerData = settings?.header_section_setting;

    const isArray = Array.isArray(headerData);

    const isSingleImage = typeof headerData === "string" && headerData.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const isVideo = typeof headerData === "string" && headerData.match(/\.(mp4|webm|ogg)$/i);
    const isText = typeof headerData === "string" && !isSingleImage && !isVideo;

    const images = isArray ? headerData : [];

    const [current, setCurrent] = useState(0);

    // Auto slider
    useEffect(() => {
        if (images.length > 1) {
            const interval = setInterval(() => {
                setCurrent((prev) => (prev + 1) % images.length);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [images.length]);
    

    // Helper function for storage paths
    const path = (file) =>
        file?.startsWith("http") ? file : `/storage/${file}`;


    return (
        <header className="bg-white shadow-sm relative">

            {/* ------------------ TOP BAR ------------------ */}
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-0">

                {settings?.tagline && (
                    <p className="hidden md:block text-gray-600 italic">
                        {settings.tagline}
                    </p>
                )}

                <div className="flex items-center space-x-6">
                    {settings?.social_links && (
                        <div className="flex space-x-3">
                            {settings.social_links.facebook && (
                                <a href={settings.social_links.facebook} target="_blank">
                                    <Facebook size={18} className="text-gray-500 hover:text-blue-600" />
                                </a>
                            )}
                            {settings.social_links.twitter && (
                                <a href={settings.social_links.twitter} target="_blank">
                                    <Twitter size={18} className="text-gray-500 hover:text-sky-500" />
                                </a>
                            )}
                            {settings.social_links.instagram && (
                                <a href={settings.social_links.instagram} target="_blank">
                                    <Instagram size={18} className="text-gray-500 hover:text-pink-500" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>



            {/* ------------------ HEADER SECTION HANDLING ------------------ */}

            {/* ---- 1️⃣ SINGLE IMAGE ---- */}
            {isSingleImage && (
                <div className="w-full h-[90vh] md:h-[90vh] overflow-hidden">
                    <img
                        src={path(headerData)}
                        className="w-full h-full object-cover"
                        alt="Header"
                    />
                </div>
            )}


            {/* ---- 2️⃣ VIDEO ---- */}
            {isVideo && (
                <div className="relative w-full h-[80vh] md:h-[90vh]">
                    <video
                        src={path(headerData)}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    ></video>

                    {/* Optional overlay */}
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            )}


            {/* ---- 3️⃣ TEXT HEADER ---- */}
            {isText && (
                <div className="w-full h-[70vh] md:h-[85vh] flex items-center justify-center bg-gray-900 text-white">
                    <h1 className="text-4xl md:text-6xl font-bold text-center px-6">
                        {headerData}
                    </h1>
                </div>
            )}


            {/* ---- 4️⃣ MULTIPLE IMAGES (SLIDER) ---- */}
            {isArray && images.length > 0 && (
                <div className="relative w-full overflow-hidden h-[80vh] md:h-[90vh]">
                    <div
                        className="flex transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${current * 100}%)` }}
                    >
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={path(img)}
                                className="w-full h-[80vh] md:h-[90vh] object-cover flex-shrink-0"
                                alt=""
                            />
                        ))}
                    </div>

                    {/* Dots */}
                    {images.length > 1 && (
                        <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-3 h-3 rounded-full ${
                                        current === idx ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                                ></button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
