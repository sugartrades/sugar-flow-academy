
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CourseFiltersProps {
  searchTerm: string;
  selectedDifficulty: string;
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  isAuthenticated: boolean;
}

export function CourseFilters({ 
  searchTerm, 
  selectedDifficulty, 
  onSearchChange, 
  onDifficultyChange, 
  isAuthenticated 
}: CourseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1">
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={!isAuthenticated}
        />
      </div>
      <Select value={selectedDifficulty} onValueChange={onDifficultyChange} disabled={!isAuthenticated}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Course Tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value="free">Free Tier</SelectItem>
          <SelectItem value="advanced">Advanced Tier</SelectItem>
          <SelectItem value="pro">Pro Tier</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
