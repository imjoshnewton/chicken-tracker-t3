'use client';

import { useState } from 'react';
import { BreedingPlanner } from '../../../../../components/breeding/BreedingPlanner';
import { Bird } from '../../../../../components/breeding/BirdProfile';
import { BreedingPair } from '../../../../../components/breeding/BreedingPairManager';
import { createId } from '@paralleldrive/cuid2';

// Sample data for testing
const sampleBirds: Bird[] = [
  {
    id: "1",
    name: "Thunder",
    tagNumber: "R001",
    hatchDate: "2022-03-15",
    sex: "male",
    breedId: "brahma",
    breed: "Light Brahma",
    genetics: { traits: ["Feathered Legs", "Rose Comb"], color: "Light" },
    imageUrl: "/chicken.svg"
  },
  {
    id: "2", 
    name: "Pearl",
    tagNumber: "H001",
    hatchDate: "2022-04-02",
    sex: "female",
    breedId: "brahma",
    breed: "Light Brahma", 
    genetics: { traits: ["Feathered Legs", "Single Comb"], color: "Light" },
    imageUrl: "/chicken.svg"
  },
  {
    id: "3",
    name: "Stormy",
    tagNumber: "C001", 
    hatchDate: "2023-05-10",
    sex: "female",
    breedId: "brahma",
    breed: "Light Brahma",
    parentMaleId: "1",
    parentFemaleId: "2",
    genetics: { traits: ["Feathered Legs", "Rose Comb"], color: "Light" },
    imageUrl: "/chicken.svg"
  },
  {
    id: "4",
    name: "Rusty",
    tagNumber: "R002",
    hatchDate: "2022-02-10",
    sex: "male",
    breedId: "rhodeislandred",
    breed: "Rhode Island Red",
    genetics: { traits: ["Single Comb", "Brown Egg"], color: "Red" },
    imageUrl: "/chicken.svg"
  },
  {
    id: "5",
    name: "Goldie",
    tagNumber: "H002",
    hatchDate: "2022-05-15",
    sex: "female",
    breedId: "orpington",
    breed: "Buff Orpington",
    genetics: { traits: ["Single Comb", "Brown Egg"], color: "Buff" },
    imageUrl: "/chicken.svg"
  },
  {
    id: "6",
    name: "Midnight",
    tagNumber: "H003",
    hatchDate: "2023-01-20",
    sex: "female",
    breedId: "australorp",
    breed: "Black Australorp",
    genetics: { traits: ["Single Comb", "Brown Egg"], color: "Black" },
    imageUrl: "/chicken.svg"
  },
  {
    id: "7",
    name: "Blaze",
    tagNumber: "R003",
    hatchDate: "2022-06-01",
    sex: "male",
    breedId: "newhampshire",
    breed: "New Hampshire",
    genetics: { traits: ["Single Comb", "Brown Egg"], color: "Red" },
    imageUrl: "/chicken.svg"
  },
  {
    id: "8",
    name: "Sky",
    tagNumber: "H004",
    hatchDate: "2023-03-15",
    sex: "female",
    breedId: "ameraucana",
    breed: "Ameraucana",
    parentMaleId: "4",
    parentFemaleId: "5",
    genetics: { traits: ["Pea Comb", "Blue Egg", "Bearded"], color: "Blue" },
    imageUrl: "/chicken.svg"
  }
];

const samplePairs: BreedingPair[] = [
  {
    id: "pair1",
    maleId: "1",
    femaleIds: ["2"],
    name: "Thunder & Pearl",
    status: "active",
    offspring: ["3"],
    notes: "First breeding pair, excellent genetics for size and temperament"
  },
  {
    id: "pair2",
    maleId: "4",
    femaleIds: ["5", "6"],
    name: "Rusty's Group",
    status: "active",
    offspring: ["8"],
    notes: "Good egg production line"
  }
];

export default function BreedingPlannerPage() {
  const [birds, setBirds] = useState<Bird[]>(sampleBirds);
  const [breedingPairs, setBreedingPairs] = useState<BreedingPair[]>(samplePairs);
  const [loading, setLoading] = useState(false);

  const handleAddPair = (pair: Omit<BreedingPair, 'id'>) => {
    const newPair = {
      ...pair,
      id: createId(),
    };
    setBreedingPairs([...breedingPairs, newPair]);
  };

  const handleUpdatePair = (updatedPair: BreedingPair) => {
    setBreedingPairs(
      breedingPairs.map(pair => 
        pair.id === updatedPair.id ? updatedPair : pair
      )
    );
  };

  const handleDeletePair = (pairId: string) => {
    setBreedingPairs(breedingPairs.filter(pair => pair.id !== pairId));
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Breeding & Pedigree Planner (Demo)</h1>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          🐓 This is a demo page with sample data to test the new breeding planner feature. 
          In production, this would connect to your actual bird data.
        </p>
      </div>
      <BreedingPlanner
        birds={birds}
        breedingPairs={breedingPairs}
        onAddPair={handleAddPair}
        onUpdatePair={handleUpdatePair}
        onDeletePair={handleDeletePair}
        loading={loading}
      />
    </div>
  );
}