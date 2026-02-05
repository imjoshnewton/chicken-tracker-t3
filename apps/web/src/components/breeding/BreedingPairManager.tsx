'use client';

import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Bird } from './BirdProfile';
import { MdAdd, MdClose, MdEdit, MdDelete, MdWarning, MdSearch } from 'react-icons/md';
import Card from '../shared/Card';

export interface BreedingPair {
  id: string;
  maleId: string;
  femaleIds: string[]; // Support for multiple hens with one rooster
  name: string;
  status: 'active' | 'planned' | 'retired';
  offspring: string[]; // Bird IDs
  notes: string;
}

interface BreedingPairManagerProps {
  birds: Bird[];
  breedingPairs: BreedingPair[];
  onAddPair: (pair: Omit<BreedingPair, 'id'>) => void;
  onUpdatePair: (pair: BreedingPair) => void;
  onDeletePair: (pairId: string) => void;
  loading?: boolean;
  error?: string;
}

// Simplified bird selector without drag-and-drop for now
const BirdSelector = ({ 
  birds, 
  selectedBirds = [], 
  onSelect, 
  onRemove,
  type 
}: { 
  birds: Bird[];
  selectedBirds: Bird[];
  onSelect: (bird: Bird) => void;
  onRemove: (bird: Bird) => void;
  type: 'male' | 'female';
}) => {
  return (
    <div className="space-y-2">
      <div className="max-h-32 overflow-y-auto border rounded-md p-2">
        {selectedBirds.map((bird) => (
          <div key={bird.id} className="flex justify-between items-center p-2 bg-stone-50 dark:bg-stone-800 rounded mb-1">
            <span>{bird.name} ({bird.tagNumber})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(bird)}
              className="h-6 w-6 p-0"
            >
              <MdClose size={14} />
            </Button>
          </div>
        ))}
        {selectedBirds.length === 0 && (
          <div className="text-stone-400 text-sm text-center py-4">
            No {type === 'male' ? 'rooster' : 'hens'} selected
          </div>
        )}
      </div>
      
      <Select onValueChange={(value) => {
        const bird = birds.find(b => b.id === value);
        if (bird && !selectedBirds.some(s => s.id === bird.id)) {
          onSelect(bird);
        }
      }}>
        <SelectTrigger>
          <SelectValue placeholder={`Add ${type === 'male' ? 'rooster' : 'hen'}`} />
        </SelectTrigger>
        <SelectContent>
          {birds
            .filter(bird => bird.sex === type && !selectedBirds.some(s => s.id === bird.id))
            .map(bird => (
              <SelectItem key={bird.id} value={bird.id}>
                {bird.name} ({bird.tagNumber}) - {bird.breed}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export function BreedingPairManager({
  birds,
  breedingPairs,
  onAddPair,
  onUpdatePair,
  onDeletePair,
  loading = false,
  error,
}: BreedingPairManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editingPair, setEditingPair] = useState<BreedingPair | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // New pair form state
  const [newPairName, setNewPairName] = useState('');
  const [newPairStatus, setNewPairStatus] = useState<'active' | 'planned' | 'retired'>('planned');
  const [newPairNotes, setNewPairNotes] = useState('');
  const [selectedMale, setSelectedMale] = useState<Bird[]>([]);
  const [selectedFemales, setSelectedFemales] = useState<Bird[]>([]);

  // Filter birds by sex
  const males = birds.filter(bird => bird.sex === 'male');
  const females = birds.filter(bird => bird.sex === 'female');

  // Filter breeding pairs by status and search query
  const filteredPairs = breedingPairs.filter(pair => {
    if (activeTab !== 'all' && pair.status !== activeTab) return false;
    
    if (searchQuery) {
      const male = birds.find(b => b.id === pair.maleId);
      const females = birds.filter(b => pair.femaleIds.includes(b.id));
      
      return (
        pair.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (male && male.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        females.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return true;
  });

  const handleAddPair = () => {
    if (selectedMale.length === 0 || selectedFemales.length === 0) return;
    
    const male = selectedMale[0];
    if (!male) return;
    
    onAddPair({
      maleId: male.id,
      femaleIds: selectedFemales.map(f => f.id),
      name: newPairName || `${male.name} × ${selectedFemales.map(f => f.name).join(' & ')}`,
      status: newPairStatus,
      offspring: [],
      notes: newPairNotes,
    });
    
    // Reset form
    setNewPairName('');
    setNewPairStatus('planned');
    setNewPairNotes('');
    setSelectedMale([]);
    setSelectedFemales([]);
    setIsAddDialogOpen(false);
  };

  const handleUpdatePair = () => {
    if (!editingPair) return;
    onUpdatePair(editingPair);
    setEditingPair(null);
  };

  const getStatusBadge = (status: 'active' | 'planned' | 'retired') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Planned</Badge>;
      case 'retired':
        return <Badge className="bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-100">Retired</Badge>;
    }
  };

  return (
    <Card>
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Breeding Pairs</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <MdAdd className="mr-2 h-4 w-4" />
              New Pair
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Breeding Pair</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                  <label className="text-sm font-medium mb-1 block text-stone-500 dark:text-stone-400">
                    Pair Name (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Brahma Breeding Group 1"
                    value={newPairName}
                    onChange={(e) => setNewPairName(e.target.value)}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-sm font-medium mb-1 block text-stone-500 dark:text-stone-400">
                    Status
                  </label>
                  <Select 
                    value={newPairStatus} 
                    onValueChange={(value) => setNewPairStatus(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-stone-500 dark:text-stone-400">
                  Rooster
                </label>
                <BirdSelector
                  birds={males}
                  selectedBirds={selectedMale}
                  onSelect={(bird) => setSelectedMale([bird])}
                  onRemove={() => setSelectedMale([])}
                  type="male"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-stone-500 dark:text-stone-400">
                  Hens
                </label>
                <BirdSelector
                  birds={females}
                  selectedBirds={selectedFemales}
                  onSelect={(bird) => setSelectedFemales([...selectedFemales, bird])}
                  onRemove={(bird) => setSelectedFemales(selectedFemales.filter(f => f.id !== bird.id))}
                  type="female"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-stone-500 dark:text-stone-400">
                  Notes
                </label>
                <Textarea
                  placeholder="Add any notes about this breeding pair..."
                  value={newPairNotes}
                  onChange={(e) => setNewPairNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddPair}
                disabled={selectedMale.length === 0 || selectedFemales.length === 0}
              >
                Create Pair
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MdSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search pairs or birds..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'planned', 'retired'].map((status) => (
            <Button
              key={status}
              variant={activeTab === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-stone-200 dark:border-stone-700 rounded-full border-t-stone-500"></div>
          </div>
        ) : filteredPairs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg">
            <div className="text-stone-400 dark:text-stone-500 mb-2">No breeding pairs found</div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <MdAdd className="mr-2 h-4 w-4" />
              Create your first pair
            </Button>
          </div>
        ) : (
          filteredPairs.map(pair => {
            const male = birds.find(b => b.id === pair.maleId);
            const females = birds.filter(b => pair.femaleIds.includes(b.id));
            
            return (
              <div key={pair.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{pair.name}</h3>
                      {getStatusBadge(pair.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {male && (
                        <div className="flex items-center bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded text-sm">
                          <span className="mr-1">♂</span> {male.name}
                        </div>
                      )}
                      {females.map(female => (
                        <div 
                          key={female.id} 
                          className="flex items-center bg-stone-50 dark:bg-stone-900 px-2 py-1 rounded text-sm"
                        >
                          <span className="mr-1">♀</span> {female.name}
                        </div>
                      ))}
                    </div>
                    
                    {pair.offspring.length > 0 && (
                      <div className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                        {pair.offspring.length} offspring
                      </div>
                    )}
                    
                    {pair.notes && (
                      <div className="mt-2 text-sm text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900 p-2 rounded">
                        {pair.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => setEditingPair(pair)}
                    >
                      <MdEdit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="h-8"
                      onClick={() => onDeletePair(pair.id)}
                    >
                      <MdDelete className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Edit Pair Dialog */}
      {editingPair && (
        <Dialog open={!!editingPair} onOpenChange={(open) => !open && setEditingPair(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Breeding Pair</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                  <label className="text-sm font-medium mb-1 block text-stone-500 dark:text-stone-400">
                    Pair Name
                  </label>
                  <Input
                    value={editingPair.name}
                    onChange={(e) => setEditingPair({...editingPair, name: e.target.value})}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-sm font-medium mb-1 block text-stone-500 dark:text-stone-400">
                    Status
                  </label>
                  <Select 
                    value={editingPair.status} 
                    onValueChange={(value) => setEditingPair({...editingPair, status: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-stone-500 dark:text-stone-400">
                  Notes
                </label>
                <Textarea
                  value={editingPair.notes}
                  onChange={(e) => setEditingPair({...editingPair, notes: e.target.value})}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPair(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePair}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}