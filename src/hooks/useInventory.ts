import { useState, useEffect } from 'react';
import { Article, Section, RecentActivity, InventoryState } from '@/types/inventory';

const STORAGE_KEY = 'inventory_data';

export const useInventory = () => {
  const [state, setState] = useState<InventoryState>({
    articles: [],
    sections: [],
    recentActivities: [],
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setState(parsed);
      } catch (error) {
        console.error('Error loading inventory data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addRecentActivity = (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => {
    const newActivity: RecentActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      recentActivities: [newActivity, ...prev.recentActivities.slice(0, 49)], // Keep only last 50
    }));
  };

  const addArticle = (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArticle: Article = {
      ...articleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      articles: [...prev.articles, newArticle],
    }));

    addRecentActivity({
      articleCode: newArticle.code,
      articleName: newArticle.name,
      action: 'created',
      details: `Agregado a ${articleData.sectionId ? 'sección específica' : 'inventario general'}`,
    });

    return newArticle;
  };

  const updateArticle = (articleId: string, updates: Partial<Article>) => {
    setState(prev => ({
      ...prev,
      articles: prev.articles.map(article =>
        article.id === articleId
          ? { ...article, ...updates, updatedAt: new Date().toISOString() }
          : article
      ),
    }));

    const article = state.articles.find(a => a.id === articleId);
    if (article) {
      addRecentActivity({
        articleCode: article.code,
        articleName: article.name,
        action: 'updated',
        details: 'Información actualizada',
      });
    }
  };

  const deleteArticle = (articleId: string) => {
    const article = state.articles.find(a => a.id === articleId);
    
    setState(prev => ({
      ...prev,
      articles: prev.articles.filter(a => a.id !== articleId),
    }));

    if (article) {
      addRecentActivity({
        articleCode: article.code,
        articleName: article.name,
        action: 'deleted',
        details: 'Artículo eliminado',
      });
    }
  };

  const addSection = (sectionData: Omit<Section, 'id' | 'createdAt' | 'articles'>) => {
    const newSection: Section = {
      ...sectionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      articles: [],
    };

    setState(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    return newSection;
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    }));
  };

  const deleteSection = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
      articles: prev.articles.map(article =>
        article.sectionId === sectionId
          ? { ...article, sectionId: undefined }
          : article
      ),
    }));
  };

  const bulkAddArticles = (articlesData: string) => {
    const lines = articlesData.trim().split('\n');
    const addedArticles: Article[] = [];
    const updatedArticles: Article[] = [];

    lines.forEach(line => {
      const parts = line.split(/\t|,/).map(part => part.trim());
      if (parts.length >= 5) {
        const [code, name, brand, unitsStr, priceStr, reference = ''] = parts;
        const units = parseInt(unitsStr) || 0;
        const price = parseFloat(priceStr) || 0;

        // Check if article exists
        const existingArticle = state.articles.find(a => a.code === code);
        
        if (existingArticle) {
          updateArticle(existingArticle.id, {
            name,
            brand,
            units,
            price,
            reference,
          });
          updatedArticles.push(existingArticle);
        } else {
          const newArticle = addArticle({
            code,
            name,
            brand,
            units,
            price,
            reference,
          });
          addedArticles.push(newArticle);
        }
      }
    });

    return { addedArticles, updatedArticles };
  };

  const searchArticles = (query: string, sectionId?: string) => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(' ');
    let articlesToSearch = state.articles;

    if (sectionId) {
      articlesToSearch = state.articles.filter(a => a.sectionId === sectionId);
    }

    return articlesToSearch.filter(article => {
      const searchableText = `${article.code} ${article.name} ${article.brand} ${article.reference}`.toLowerCase();
      
      return searchTerms.every(term => {
        // Exact match
        if (searchableText.includes(term)) return true;
        
        // Abbreviation matching (e.g., "cb" matches "cable")
        const words = searchableText.split(' ');
        return words.some(word => {
          if (word.startsWith(term)) return true;
          // Check if term could be an abbreviation
          if (term.length <= 3) {
            const wordAbbrev = word.split('').slice(0, term.length).join('');
            return wordAbbrev === term;
          }
          return false;
        });
      });
    });
  };

  return {
    ...state,
    addArticle,
    updateArticle,
    deleteArticle,
    addSection,
    updateSection,
    deleteSection,
    bulkAddArticles,
    searchArticles,
  };
};