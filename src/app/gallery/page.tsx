"use client";

import { useState, useEffect } from 'react';
import { Loader, X } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
  id: number;
  description: string;
  category: string;
  imageData: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClientGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/galeria`);
      if (!response.ok) throw new Error("Error al cargar la galería");
      const data: GalleryImage[] = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 bg-gray-900 text-white min-h-screen flex justify-center items-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Nuestra Galería</h1>
        <p className="mt-2 text-lg text-gray-300">Explora los estilos y cortes de nuestros talentosos barberos.</p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">Aún no hay imágenes en nuestra galería. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div 
              key={image.id} 
              className="group rounded-lg shadow-lg bg-gray-800 flex flex-col overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => setSelectedImage(image)}
            >
              <div className="overflow-hidden">
                <Image
                  src={image.imageData}
                  alt={image.description}
                  width={400}
                  height={400}
                  className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
              </div>
              <div className="p-4 flex-grow">
                <h3 className="text-lg font-bold text-white">{image.category}</h3>
                <p className="text-sm text-gray-300 mt-1">{image.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-2 -right-2 text-white bg-gray-800 rounded-full p-1 z-10"
            >
              <X size={24} />
            </button>
            <Image
              src={selectedImage.imageData}
              alt={selectedImage.description}
              width={1200}
              height={1200}
              className="object-contain w-auto h-auto max-h-[85vh] rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}