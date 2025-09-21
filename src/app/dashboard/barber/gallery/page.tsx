// En: /app/dashboard/barber/gallery/page.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Plus, X, Edit, Trash2, Save, Loader } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
  id: number;
  fileName: string; 
  description: string;
  category: string;
}

// --- FUNCIÓN AUXILIAR MEJORADA ---
// Esta función toma el nombre del archivo y construye la URL web de forma segura.
const buildImageUrl = (fileName: any): string => {
  if (typeof fileName !== 'string' || !fileName.trim()) {
    return ''; // Devuelve una cadena vacía si el nombre del archivo no es válido
  }
  // Construye la ruta web correcta que Next.js puede entender.
  return `/gallery/${fileName}`;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState({ description: '', category: '' });
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Por favor, selecciona una imagen.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('description', description);
    formData.append('category', category);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error en la subida');
      
      closeModal();
      await fetchImages();

    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      try {
        await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
        setImages(images.filter(img => img.id !== id));
      } catch (error) {
        alert('Error al eliminar la imagen.');
      }
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setEditText({ description: image.description, category: image.category });
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editText),
      });
      const updatedImage = await response.json();
      setImages(images.map(img => (img.id === id ? { ...img, ...updatedImage } : img)));
      setEditingId(null);
    } catch (error) {
      alert('Error al guardar los cambios.');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setDescription('');
    setCategory('');
    setSelectedFile(null);
    setUploadError(null);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Galería de Trabajos</h1>
        <button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
          <Plus className="mr-2 h-5 w-5" /> Subir Imagen
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="group rounded-lg shadow-lg bg-gray-800 flex flex-col overflow-hidden">
            <div onClick={() => setSelectedImage(image)} className="cursor-pointer overflow-hidden">
              <Image
                // --- CORRECCIÓN APLICADA AQUÍ ---
                // Usamos la función auxiliar para construir la ruta de forma segura
                src={buildImageUrl(image.fileName)}
                alt={image.description}
                width={400}
                height={400}
                className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-110"
                unoptimized
              />
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              {editingId === image.id ? (
                <div className="flex flex-col gap-2">
                  <input type="text" value={editText.category} onChange={(e) => setEditText({ ...editText, category: e.target.value })} className="bg-gray-700 p-1 rounded text-lg font-bold w-full"/>
                  <input type="text" value={editText.description} onChange={(e) => setEditText({ ...editText, description: e.target.value })} className="bg-gray-700 p-1 rounded text-sm w-full"/>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-white">{image.category}</h3>
                  <p className="text-sm text-gray-300">{image.description}</p>
                </div>
              )}
              <div className="flex justify-end items-center gap-2 mt-2">
                {editingId === image.id ? (
                  <button onClick={() => handleSaveEdit(image.id)} className="p-2 text-green-400 hover:text-green-300"><Save size={20} /></button>
                ) : (
                  <button onClick={() => handleEdit(image)} className="p-2 text-blue-400 hover:text-blue-300"><Edit size={20} /></button>
                )}
                <button onClick={() => handleDelete(image.id)} className="p-2 text-red-500 hover:text-red-400"><Trash2 size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && !isLoading && (
        <div className="text-center py-20"><p className="text-gray-400">Tu galería está vacía.</p></div>
      )}

      {/* El resto del código para el modal y el lightbox no necesita cambios */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-bold mb-6">Subir Nueva Imagen</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Imagen</label>
                <div className="flex items-center">
                  <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer">
                    <span>Seleccionar archivo</span>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" required />
                  </label>
                  {selectedFile && <span className="ml-4 text-gray-400 truncate max-w-xs">{selectedFile.name}</span>}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-700 p-2 rounded" required />
              </div>
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-700 p-2 rounded" required />
              </div>
              {uploadError && <div className="bg-red-500 p-3 rounded mb-4">{uploadError}</div>}
              <button type="submit" disabled={isUploading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded disabled:bg-gray-500">
                {isUploading ? 'Subiendo...' : 'Confirmar y Subir'}
              </button>
            </form>
          </div>
        </div>
      )}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-2 -right-2 text-white bg-gray-800 rounded-full p-1 z-10"
            >
              <X size={24} />
            </button>
            <Image
              // --- CORRECCIÓN APLICADA TAMBIÉN EN EL LIGHTBOX ---
              src={buildImageUrl(selectedImage.fileName)}
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