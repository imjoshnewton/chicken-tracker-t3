'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MdCalendarToday, MdLabel } from 'react-icons/md';
import Card from '../shared/Card';

export interface Bird {
  id: string;
  name: string;
  tagNumber: string;
  hatchDate: string;
  sex: 'male' | 'female';
  breedId: string;
  breed: string;
  parentMaleId?: string;
  parentFemaleId?: string;
  genetics: {
    traits: string[]; // e.g., ["Blue Egg", "Rose Comb", "Feathered Legs"]
    color: string;
  };
  imageUrl?: string;
}

interface BirdProfileProps {
  bird: Bird;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (bird: Bird) => void;
  onViewPedigree?: (bird: Bird) => void;
  className?: string;
}

// Map trait names to colors for badges
const traitColorMap: Record<string, string> = {
  'Blue Egg': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  'Green Egg': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  'Brown Egg': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  'White Egg': 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100',
  'Rose Comb': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
  'Pea Comb': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'Single Comb': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  'Feathered Legs': 'bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-100',
  'Bearded': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  'Frizzle': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  'Silkie': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
};

export function BirdProfile({
  bird,
  isSelectable = false,
  isSelected = false,
  onSelect,
  onViewPedigree,
  className = '',
}: BirdProfileProps) {
  const [imageError, setImageError] = useState(false);
  
  const formattedDate = new Date(bird.hatchDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`transition-all duration-200 h-full ${
        isSelectable 
          ? 'cursor-pointer hover:shadow-md hover:translate-y-[-2px]' 
          : ''
      } ${
        isSelected 
          ? 'ring-2 ring-stone-500 dark:ring-stone-300' 
          : ''
      } ${className}`}
      onClick={isSelectable && onSelect ? () => onSelect(bird) : undefined}
    >
      <Card>
        <div className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium flex items-center gap-2">
              {bird.name}
              <Badge 
                className={bird.sex === 'male' ? 'ml-2' : 'ml-2 bg-secondary'}
              >
                {bird.sex === 'male' ? '♂' : '♀'}
              </Badge>
            </h3>
            <div className="flex items-center gap-1">
              <div className="flex items-center text-stone-500 dark:text-stone-400 text-sm">
                <MdLabel size={14} className="mr-1" />
                {bird.tagNumber}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
            <div className="relative h-[120px] w-full md:w-[120px] bg-stone-100 dark:bg-stone-800 rounded-md overflow-hidden">
              {!imageError && bird.imageUrl && bird.imageUrl !== '' ? (
                <Image
                  src={bird.imageUrl}
                  alt={bird.name}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                    <path d="M3 14s2-2 6-2 6 2 6 2"/>
                    <path d="M19 11V9a2 2 0 0 0-2-2h-1"/>
                    <path d="M19 15v-2"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-stone-400 dark:text-stone-500 text-xs mb-1">Breed</p>
                <p className="font-medium">{bird.breed}</p>
              </div>
              
              <div>
                <p className="text-stone-400 dark:text-stone-500 text-xs mb-1 flex items-center">
                  <MdCalendarToday size={12} className="mr-1" /> Hatch Date
                </p>
                <p>{formattedDate}</p>
              </div>
              
              <div>
                <p className="text-stone-400 dark:text-stone-500 text-xs mb-1">Genetics</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge className="bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600">
                    {bird.genetics.color}
                  </Badge>
                  {bird.genetics.traits.map((trait) => (
                    <Badge 
                      key={trait} 
                      className={traitColorMap[trait] || "bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200"}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {onViewPedigree && (
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewPedigree(bird);
                }}
                className="text-xs"
              >
                View Pedigree
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}