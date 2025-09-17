import { useState, useEffect, useCallback } from 'react';
import { Article, Section } from '@/types/inventory';
import { useToast } from './use-toast';

// Helper para transformar los datos del backend (_id) al formato del frontend (id)
const transformApiResponse = (data: any[]) => {
  return data.map(item => {
    const { _id, section, ...rest } = item;
    const transformedItem: any = { id: _id, ...rest };
    if (section && typeof section === 'object' && section._id) {
      transformedItem.section = section._id; // Assuming section is populated and has _id
    } else if (section) {
      transformedItem.section = section; // If section is just the ID string
    }
    return transformedItem;
  });
};

export const useInventory = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]); // Estado para actividades recientes
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    // No recargar si ya está cargando
    if (!loading) setLoading(true);
    try {
      const [articlesRes, sectionsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/sections'),
      ]);

      if (!articlesRes.ok || !sectionsRes.ok) {
        throw new Error('Error al obtener los datos del servidor.');
      }

      const articlesData = await articlesRes.json();
      const sectionsData = await sectionsRes.json();

      setArticles(transformApiResponse(articlesData));
      setSections(transformApiResponse(sectionsData));
      
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Ocurrió un error inesperado";
      setError(errorMessage);
      toast({ title: "Error de Carga", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]); // `loading` no es necesaria como dependencia aquí

  useEffect(() => {
    fetchData();
  }, []); // Solo se ejecuta una vez al montar el hook

  const makeApiCall = async (url: string, method: string, body?: any, successMessage?: string) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error en la operación ${method}`);
      }
      
      if (successMessage) {
        toast({ title: "Éxito", description: successMessage });
      }

      await fetchData(); // Refrescar los datos después de cada operación exitosa
      return await response.json();
    } catch (err: any) {
      toast({ title: "Error en la operación", description: err.message, variant: "destructive" });
      throw err; // Lanzar el error para que el componente que llama pueda manejarlo si es necesario
    }
  };

  // --- Funciones de Sección ---
  const addSection = (data: { name: string; description?: string }) => 
    makeApiCall('/api/sections', 'POST', data, 'Sección creada exitosamente.');

  const updateSection = (id: string, data: { name: string; description?: string }) => 
    makeApiCall(`/api/sections/${id}`, 'PUT', data, 'Sección actualizada exitosamente.');

  const deleteSection = (id: string) => 
    makeApiCall(`/api/sections/${id}`, 'DELETE', undefined, 'Sección eliminada exitosamente.');

  // --- Funciones de Artículo ---
  const addArticle = (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => 
    makeApiCall('/api/inventory', 'POST', data, 'Artículo creado exitosamente.');

  const updateArticle = (id: string, data: Partial<Omit<Article, 'id'>>) => 
    makeApiCall(`/api/inventory/${id}`, 'PUT', data, 'Artículo actualizado exitosamente.');

  const deleteArticle = (id: string) => 
    makeApiCall(`/api/inventory/${id}`, 'DELETE', undefined, 'Artículo eliminado exitosamente.');

  // La búsqueda se mantiene en el cliente para una respuesta instantánea
  const searchArticles = (query: string, sectionId: string): Article[] => {
    const lowercasedQuery = query.toLowerCase();
    return articles.filter(
      (article) =>
        article.sectionId === sectionId &&
        (article.name.toLowerCase().includes(lowercasedQuery) ||
          article.code.toLowerCase().includes(lowercasedQuery) ||
          (article.brand && article.brand.toLowerCase().includes(lowercasedQuery)))
    );
  };

  return {
    articles,
    sections,
    loading,
    error,
    addArticle,
    updateArticle,
    deleteArticle,
    addSection,
    updateSection,
    deleteSection,
    searchArticles,
    refetch: fetchData,
    recentActivities, // Devolver las actividades recientes
  };
};