import { useState, useEffect, useCallback } from 'react';
import { Article, Section } from '@/types/inventory';
import { useToast } from './use-toast';

const transformApiResponse = (data: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  return data.map(item => {
    const { _id, section, ...rest } = item;
    const transformedItem: any = { id: _id, ...rest }; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (section && typeof section === 'object' && section._id) {
      transformedItem.section = section._id; // Assuming section is populated and has _id
    } else if (section) {
      transformedItem.section = section; // If section is just the ID string
    }
    // Explicitly convert Decimal128 to number if they exist
    if (transformedItem.unitPrice && typeof transformedItem.unitPrice.toString === 'function') {
      transformedItem.unitPrice = parseFloat(transformedItem.unitPrice.toString());
    }
    if (transformedItem.totalValue && typeof transformedItem.totalValue.toString === 'function') {
      transformedItem.totalValue = parseFloat(transformedItem.totalValue.toString());
    }
    if (transformedItem.detal && typeof transformedItem.detal.toString === 'function') {
      transformedItem.detal = parseFloat(transformedItem.detal.toString());
    }
    if (transformedItem.mayor && typeof transformedItem.mayor.toString === 'function') {
      transformedItem.mayor = parseFloat(transformedItem.mayor.toString());
    }
    return transformedItem;
  });
};

export const useInventory = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);  // eslint-disable-line @typescript-eslint/no-explicit-any
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    // No recargar si ya está cargando
    if (!loading) setLoading(true);
    try {
      const [articlesRes, sectionsRes, activitiesRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/sections'),
        fetch('/api/activities'),
      ]);

      if (!articlesRes.ok || !sectionsRes.ok || !activitiesRes.ok) {
        throw new Error('Error al obtener los datos del servidor.');
      }

      const articlesData = await articlesRes.json();
      const sectionsData = await sectionsRes.json();
      const activitiesData = await activitiesRes.json();

      setArticles(transformApiResponse(articlesData));
      setSections(transformApiResponse(sectionsData));
      setRecentActivities(transformApiResponse(activitiesData));
      
      setError(null);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      const errorMessage = err.message || "Ocurrió un error inesperado";
      setError(errorMessage);
      toast({ title: "Error de Carga", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]); // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const makeApiCall = async (url: string, method: string, body?: any, successMessage?: string) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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

      return await response.json(); 
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast({ title: "Error en la operación", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const logActivity = async (action: 'created' | 'updated' | 'deleted', entity: 'article', entityId: string, details?: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const user = { id: '60d21b4667d0d8992e610c85', name: 'Admin' }; 

    const activityData = {
      user,
      action,
      entity,
      entityId,
      ...details,
    };

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  // --- Funciones de Sección ---
  const addSection = async (data: { name: string; description?: string }) => {
    const newSection = await makeApiCall('/api/sections', 'POST', data, 'Sección creada exitosamente.');
    await fetchData(); // Refrescar datos
    return newSection;
  };

  const updateSection = async (id: string, data: { name: string; description?: string }) => {
    const updatedSection = await makeApiCall(`/api/sections/${id}`, 'PUT', data, 'Sección actualizada exitosamente.');
    await fetchData();
    return updatedSection;
  };

  const deleteSection = async (id: string) => {
    const deletedSection = await makeApiCall(`/api/sections/${id}`, 'DELETE', undefined, 'Sección eliminada exitosamente.');
    await fetchData();
    return deletedSection;
  };

  // --- Funciones de Artículo ---
  const addArticle = async (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArticleData = await makeApiCall('/api/inventory', 'POST', data, 'Artículo creado exitosamente.');
    const newArticle = transformApiResponse([newArticleData])[0];
    
    if (newArticle) {
      await logActivity('created', 'article', newArticle.id, {
        articleCode: newArticle.code,
        articleName: newArticle.name,
        details: `Se añadieron ${newArticle.units} unidades.`,
      });
      await fetchData(); // Refrescar todo, incluyendo actividades
    }
    return newArticle;
  };

  const updateArticle = async (id: string, data: Partial<Omit<Article, 'id'>>) => {
    const originalArticle = articles.find(a => a.id === id);
    const updatedArticleData = await makeApiCall(`/api/inventory/${id}`, 'PUT', data, 'Artículo actualizado exitosamente.');
    const updatedArticle = transformApiResponse([updatedArticleData])[0];

    if (updatedArticle && originalArticle) {
      const changes = Object.keys(data)
        .filter(key => (data as any)[key] !== (originalArticle as any)[key]) // eslint-disable-line @typescript-eslint/no-explicit-any
        .map(key => `${key}: de '${(originalArticle as any)[key]}' a '${(data as any)[key]}'`); // eslint-disable-line @typescript-eslint/no-explicit-any

      await logActivity('updated', 'article', id, {
        articleCode: updatedArticle.code,
        articleName: updatedArticle.name,
        details: changes.length > 0 ? `Cambios: ${changes.join(', ')}` : 'Sin cambios detectados.',
      });
      await fetchData();
    }
    return updatedArticle;
  };

  const deleteArticle = async (id: string) => {
    const articleToDelete = articles.find(a => a.id === id);
    const deletedArticle = await makeApiCall(`/api/inventory/${id}`, 'DELETE', undefined, 'Artículo eliminado exitosamente.');
    
    if (articleToDelete) {
      await logActivity('deleted', 'article', id, {
        articleCode: articleToDelete.code,
        articleName: articleToDelete.name,
        details: 'Artículo eliminado del inventario.',
      });
      await fetchData();
    }
    return deletedArticle;
  };

  // La búsqueda se mantiene en el cliente para una respuesta instantánea
  const searchArticles = (query: string, sectionId?: string): Article[] => {
    const lowercasedQuery = query.toLowerCase();
    return articles.filter(
      (article) =>
        (sectionId ? article.section === sectionId : true) &&
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