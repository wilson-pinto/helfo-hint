import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { CodeSuggestion } from '../slices/medicalSlice';

const selectAcceptedCodes = (state: RootState) => state.medical.acceptedCodes;
const selectFilter = (state: RootState) => state.medical.ui.acceptedCodesFilter;
const selectSort = (state: RootState) => state.medical.ui.acceptedCodesSort;

export const selectFilteredAndSortedAcceptedCodes = createSelector(
  [selectAcceptedCodes, selectFilter, selectSort],
  (codes, filter, sort): CodeSuggestion[] => {
    let filteredCodes = codes;

    // Apply filter
    if (filter !== 'all') {
      filteredCodes = codes.filter(code => code.type === filter);
    }

    // Apply sort
    return [...filteredCodes].sort((a, b) => {
      switch (sort) {
        case 'newest':
          // Assuming codes are added to start of array, reverse order
          return -1;
        case 'oldest':
          // Assuming codes are added to start of array
          return 1;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'system':
          return a.system.localeCompare(b.system);
        default:
          return 0;
      }
    });
  }
);

export const selectSOAPCharacterCounts = (state: RootState) => state.medical.soapNote.characterCount;