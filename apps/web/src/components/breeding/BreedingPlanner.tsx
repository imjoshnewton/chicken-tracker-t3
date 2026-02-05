'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { PedigreeTree } from './PedigreeTree';
import { BreedingPairManager, BreedingPair } from './BreedingPairManager';
import { BirdProfile, Bird } from './BirdProfile';
import { MdSearch, MdFilterList, MdClose } from 'react-icons/md';
import Card from '../shared/Card';

interface BreedingPlannerProps {
  birds: Bird[];
  breedingPairs: BreedingPair[];
  onAddPair: (pair: Omit<BreedingPair, 'id'>) => void;
  onUpdatePair: (pair: BreedingPair) => void;
  onDeletePair: (pairId: string) => void;
  loading?: boolean;
}

export function BreedingPlanner({
  birds,
  breedingPairs,
  onAddPair,
  onUpdatePair,
  onDeletePair,
  loading = false,
}: BreedingPlannerProps) {
  const [activeTab, setActiveTab] = useState('birds');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [filters, setMdFilterLists] = useState({
    breed: '',
    sex: '',
    traits: [] as string[],
  });
  const [showMdFilterLists, setShowMdFilterLists] = useState(false);

  // Get unique breeds and traits for filters
  const breeds = [...new Set(birds.map(bird => bird.breed))];
  const allTraits = birds.reduce((acc, bird) => {
    bird.genetics.traits.forEach(trait => {
      if (!acc.includes(trait)) {
        acc.push(trait);
      }
    });
    return acc;
  }, [] as string[]);

  // MdFilterList birds based on search query and filters
  const filteredBirds = birds.filter(bird => {
    // MdSearch filter
    const matchesMdSearch = 
      searchQuery === '' || 
      bird.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bird.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bird.breed.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Breed filter
    const matchesBreed = filters.breed === '' || bird.breed === filters.breed;
    
    // Sex filter
    const matchesSex = filters.sex === '' || bird.sex === filters.sex;
    
    // Traits filter
    const matchesTraits = 
      filters.traits.length === 0 || 
      filters.traits.every(trait => bird.genetics.traits.includes(trait));
    
    return matchesMdSearch && matchesBreed && matchesSex && matchesTraits;
  });

  const handleViewPedigree = (bird: Bird) => {
    setSelectedBird(bird);
    setActiveTab('pedigree');
  };

  const clearMdFilterLists = () => {
    setMdFilterLists({
      breed: '',
      sex: '',
      traits: [],
    });
    setSearchQuery('');
  };

  const toggleTrait = (trait: string) => {
    if (filters.traits.includes(trait)) {
      setMdFilterLists({
        ...filters,
        traits: filters.traits.filter(t => t !== trait),
      });
    } else {
      setMdFilterLists({
        ...filters,
        traits: [...filters.traits, trait],
      });
    }
  };

  const tabs = [
    { id: 'birds', label: 'Birds' },
    { id: 'pairs', label: 'Breeding Pairs' },
    { id: 'pedigree', label: 'Pedigree', disabled: !selectedBird },
  ];

  return (
    <div className="space-y-6">
      <Card title="Breeding & Pedigree Planner">
        {/* Tab Navigation */}
        <div className="border-b border-stone-200 dark:border-stone-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-stone-500 text-stone-600 dark:text-stone-300'
                    : tab.disabled
                    ? 'border-transparent text-stone-400 dark:text-stone-600 cursor-not-allowed'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300 dark:text-stone-400 dark:hover:text-stone-300'
                  }
                `}
                disabled={tab.disabled}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Birds Tab */}
        {activeTab === 'birds' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <MdSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search birds by name, tag, or breed..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowMdFilterLists(!showMdFilterLists)}
                className={showMdFilterLists ? 'bg-stone-100 dark:bg-stone-800' : ''}
              >
                <MdFilterList className="h-4 w-4" />
              </Button>
              {(filters.breed || filters.sex || filters.traits.length > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearMdFilterLists}
                  className="hidden sm:flex"
                >
                  <MdClose className="h-4 w-4 mr-1" />
                  Clear MdFilterLists
                </Button>
              )}
            </div>
            
            {showMdFilterLists && (
              <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-900 rounded-lg">
                <h3 className="text-sm font-medium mb-3">MdFilterLists</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                      Breed
                    </label>
                    <select
                      className="w-full rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
                      value={filters.breed}
                      onChange={(e) => setMdFilterLists({...filters, breed: e.target.value})}
                    >
                      <option value="">All Breeds</option>
                      {breeds.map(breed => (
                        <option key={breed} value={breed}>{breed}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                      Sex
                    </label>
                    <select
                      className="w-full rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
                      value={filters.sex}
                      onChange={(e) => setMdFilterLists({...filters, sex: e.target.value as any})}
                    >
                      <option value="">All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                      Traits
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {allTraits.map(trait => (
                        <Button
                          key={trait}
                          variant={filters.traits.includes(trait) ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => toggleTrait(trait)}
                        >
                          {trait}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearMdFilterLists}
                  >
                    <MdClose className="h-4 w-4 mr-1" />
                    Clear MdFilterLists
                  </Button>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-stone-200 dark:border-stone-700 rounded-full border-t-stone-500"></div>
              </div>
            ) : filteredBirds.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg">
                <div className="text-stone-400 dark:text-stone-500">No birds found matching your criteria</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBirds.map(bird => (
                  <BirdProfile
                    key={bird.id}
                    bird={bird}
                    isSelectable
                    onSelect={setSelectedBird}
                    onViewPedigree={handleViewPedigree}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Breeding Pairs Tab */}
        {activeTab === 'pairs' && (
          <BreedingPairManager
            birds={birds}
            breedingPairs={breedingPairs}
            onAddPair={onAddPair}
            onUpdatePair={onUpdatePair}
            onDeletePair={onDeletePair}
            loading={loading}
          />
        )}
        
        {/* Pedigree Tab */}
        {activeTab === 'pedigree' && (
          <div>
            {selectedBird ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
                  <BirdProfile bird={selectedBird} />
                  <PedigreeTree
                    bird={selectedBird}
                    allBirds={birds}
                    onSelectBird={setSelectedBird}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg">
                <div className="text-stone-400 dark:text-stone-500">Select a bird to view its pedigree</div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}