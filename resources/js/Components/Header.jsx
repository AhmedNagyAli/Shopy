import { Link } from "@inertiajs/react";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header({ settings }) {
    const [current, setCurrent] = useState(0);

    const images = settings?.header_section_images || [];

    // Auto-slide every 5s
    useEffect(() => {
        if (images.length > 1) {
            const interval = setInterval(() => {
                setCurrent((prev) => (prev + 1) % images.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [images.length]);

    return (
        <header className="bg-white shadow-sm relative">
            {/* ✅ Header Top Section */}
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-0">
                
                {/* Left: Logo / Site Name
                <Link href="/" className="flex items-center space-x-3">
                    {settings?.logo ? (
                        <img 
                            src={settings.logo} 
                            alt={settings.site_name || "Logo"}
                            className="h-10 w-auto"
                            onError={(e) => { e.currentTarget.src = '/images/logo.png'; }}
                        />
                    ) : (
                        <span className="text-2xl font-bold text-blue-600">
                            {settings?.site_name || 'Shopy'}
                        </span>
                    )}
                </Link> */}

                {/* Middle: Tagline */}
                {settings?.tagline && (
                    <p className="hidden md:block text-gray-500 italic">
                        {settings.tagline}
                    </p>
                )}

                {/* Right: Contact + Socials */}
                <div className="flex items-center space-x-6">
                    {/* Contact Phone */}
                    {/* {settings?.contact_phone && (
                        <a href={`tel:${settings.contact_phone}`} 
                           className="text-sm text-gray-600 hover:text-blue-600">
                            {settings.contact_phone}
                        </a>
                    )} */}

                    {/* Social Links */}
                    {settings?.social_links && (
                        <div className="flex space-x-3">
                            {settings.social_links.facebook && (
                                <a href={settings.social_links.facebook} 
                                   target="_blank" rel="noreferrer"
                                   className="text-gray-500 hover:text-blue-600">
                                    <Facebook size={18} />
                                </a>
                            )}
                            {settings.social_links.twitter && (
                                <a href={settings.social_links.twitter} 
                                   target="_blank" rel="noreferrer"
                                   className="text-gray-500 hover:text-sky-500">
                                    <Twitter size={18} />
                                </a>
                            )}
                            {settings.social_links.instagram && (
                                <a href={settings.social_links.instagram} 
                                   target="_blank" rel="noreferrer"
                                   className="text-gray-500 hover:text-pink-500">
                                    <Instagram size={18} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Slider Section */}
{images.length > 0 && (
    <div className="relative w-full overflow-hidden h-[70vh] md:h-[80vh] bg-gray-100">
        <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
        >
            {images.map((img, idx) => (
                <img 
                    key={idx} 
                    src={img.startsWith("http") ? img : `/storage/${img}`} 
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-[70vh] md:h-[80vh] object-cover flex-shrink-0"
                    loading="lazy"
                />
            ))}
        </div>

        {/* Slider Dots */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
            {images.map((_, idx) => (
                <button 
                    key={idx} 
                    onClick={() => setCurrent(idx)}
                    className={`w-3 h-3 rounded-full transition ${
                        current === idx ? "bg-blue-600" : "bg-gray-300"
                    }`}
                />
            ))}
        </div>
    </div>
)}


        </header>
    );
}
