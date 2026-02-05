'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { MdExpandMore, MdChevronRight } from 'react-icons/md';
import { RiLoader4Fill } from 'react-icons/ri';
import { Bird } from './BirdProfile';
import Card from '../shared/Card';

interface PedigreeTreeProps {
  bird: Bird;
  allBirds: Bird[];
  onSelectBird?: (bird: Bird) => void;
  generations?: number;
  loading?: boolean;
  error?: string;
}

interface TreeNode {
  bird: Bird;
  expanded: boolean;
  level: number;
  position: 'male' | 'female';
}

export function PedigreeTree({
  bird,
  allBirds,
  onSelectBird,
  generations = 3,
  loading = false,
  error,
}: PedigreeTreeProps) {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const buildTree = useCallback((currentBird: Bird, level: number) => {
    if (level >= generations) return [];
    
    const nodes: TreeNode[] = [];
    nodes.push({
      bird: currentBird,
      expanded: level === 0 ? true : expandedNodes.has(currentBird.id),
      level,
      position: level === 0 ? (currentBird.sex as 'male' | 'female') : 'male'
    });
    
    // Add father if exists
    if (currentBird.parentMaleId) {
      const father = allBirds.find(b => b.id === currentBird.parentMaleId);
      if (father) {
        nodes.push(...buildTree(father, level + 1));
      }
    }
    
    // Add mother if exists
    if (currentBird.parentFemaleId) {
      const mother = allBirds.find(b => b.id === currentBird.parentFemaleId);
      if (mother) {
        nodes.push(...buildTree(mother, level + 1));
      }
    }
    
    setTreeNodes(nodes);
    return nodes;
  }, [allBirds, generations, expandedNodes]);

  useEffect(() => {
    if (bird && allBirds.length > 0) {
      buildTree(bird, 0);
    }
  }, [bird, allBirds, buildTree]);

  const toggleNode = (nodeId: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
    
    // Rebuild tree with new expanded state
    buildTree(bird, 0);
  };

  if (loading) {
    return (
      <Card title="Pedigree Tree">
        <div className="flex justify-center items-center h-64">
          <RiLoader4Fill className="h-8 w-8 animate-spin text-stone-400" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Pedigree Tree">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Pedigree Tree">
      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
        <div className="pedigree-tree min-w-[600px]">
          {treeNodes.length === 0 ? (
            <div className="text-center py-8 text-stone-500 dark:text-stone-400">
              No pedigree information available for this bird.
            </div>
          ) : (
            <div className="space-y-1">
              {treeNodes.map((node, index) => (
                <div 
                  key={`${node.bird.id}-${index}`} 
                  className={`
                    flex items-center p-2 rounded-md transition-colors
                    ${node.level > 0 ? `ml-${node.level * 8}` : ''}
                    ${node.bird.sex === 'male' 
                      ? 'bg-stone-100/50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800' 
                      : 'bg-stone-50/50 dark:bg-stone-900/50 hover:bg-stone-50 dark:hover:bg-stone-900'}
                  `}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mr-2"
                    onClick={() => toggleNode(node.bird.id)}
                    disabled={!node.bird.parentMaleId && !node.bird.parentFemaleId}
                  >
                    {(node.bird.parentMaleId || node.bird.parentFemaleId) ? (
                      node.expanded ? <MdExpandMore size={16} /> : <MdChevronRight size={16} />
                    ) : <span className="w-4" />}
                  </Button>
                  
                  <div 
                    className={`
                      flex-1 flex items-center p-2 rounded-md cursor-pointer
                      ${node.bird.sex === 'male' 
                        ? 'border-l-4 border-stone-400 dark:border-stone-600' 
                        : 'border-l-4 border-stone-300 dark:border-stone-700'}
                    `}
                    onClick={() => onSelectBird && onSelectBird(node.bird)}
                  >
                    <div className="mr-3">
                      {node.bird.sex === 'male' ? (
                        <div className="h-6 w-6 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300">♂</div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400">♀</div>
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">{node.bird.name}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">
                        {node.bird.breed} • {node.bird.tagNumber}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}