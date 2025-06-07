
import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * SearchBar Component - Movie search functionality
 * 
 * Features:
 * - Real-time search input
 * - Search suggestions/autocomplete
 * - Filter options (language, difficulty, genre)
 * - Recent searches
 * - Cross-platform mobile optimization
 * 
 * Backend Integration Notes:
 * - Connect to movie database API
 * - Implement search analytics
 * - Store user search history
 * - Add search result caching
 */

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

interface SearchFilters {
  language?: string;
  difficulty?: string;
  genre?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onFilterChange, 
  placeholder = "Search movies...",
  showFilters = true 
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Mock recent searches - will come from backend
  const recentSearches = ['Finding Nemo', 'Ratatouille', 'The Incredibles'];
  
  // Mock popular searches - will come from backend analytics
  const popularSearches = ['Spanish movies', 'Beginner friendly', 'Comedy'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Real-time search with debouncing (implement debounce hook)
    onSearch(value);
  };

  const handleClearSearch = () => {
    setQuery('');
    onSearch('');
    setIsExpanded(false);
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onSearch(searchTerm);
    setIsExpanded(false);
  };

  return (
    <div className="relative w-full">
      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsExpanded(true)}
          className="pl-10 pr-20 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background focus:border-primary transition-all duration-200"
        />
        
        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Search Panel */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="p-4 border-b border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleRecentSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && !query && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Popular</h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    onClick={() => handleRecentSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Preview */}
          {query && (
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Search results for "{query}" will appear here...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 p-4">
          <h4 className="font-medium text-foreground mb-3">Filters</h4>
          
          {/* Language Filter */}
          <div className="mb-3">
            <label className="text-sm text-muted-foreground mb-1 block">Language</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Spanish', 'French', 'German', 'Italian'].map((lang) => (
                <Badge
                  key={lang}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="mb-3">
            <label className="text-sm text-muted-foreground mb-1 block">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <Badge
                  key={level}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setShowFilterPanel(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setShowFilterPanel(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Overlay to close expanded panels */}
      {(isExpanded || showFilterPanel) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsExpanded(false);
            setShowFilterPanel(false);
          }}
        />
      )}
    </div>
  );
};

export default SearchBar;
