import { Search, MapPin, ListFilter } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
}

const SearchBar = ({ 
  searchQuery, setSearchQuery, 
  selectedCategory, setSelectedCategory,
  locationFilter, setLocationFilter
}: SearchBarProps) => {
  const categories = ['All', 'Food', 'Drink', 'Other'];

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/20 mb-10 flex flex-col md:flex-row gap-4 relative z-20">
      
      {/* Name Search */}
      <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="What are you craving?"
          className="bg-transparent border-none outline-none text-slate-900 font-bold w-full placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        {/* Location Filter */}
        <div className="w-48 flex items-center gap-3 px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
          <MapPin className="w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Shop Area..."
            className="bg-transparent border-none outline-none text-slate-900 font-bold w-full placeholder:text-slate-400"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative group">
          <div className="h-full flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
            <ListFilter className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-700">{selectedCategory}</span>
          </div>
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                  selectedCategory === cat ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
